/**
 * Forecast for the next alarm, as pure functions so they can run in Convex
 * mutations and in scripts alike.
 *
 * Alarms are modelled as a Poisson process whose rate varies with the hour of
 * the day and the day of the week (German local time):
 *
 *   rate(t) = alarmsPerDay * 24 * hourOfDay[hour(t)] * 7 * dayOfWeek[weekday(t)] / 24
 *
 * `fitModel` reads every alarm once and condenses it into a small model.
 * `projectForecast` turns that model into dates and probabilities for a given
 * point in time without touching the alarms again, so the forecast can be
 * refreshed hourly for free and only refitted when alarms change.
 */

/** Bump when the stored shape or the maths change; stale docs get refitted. */
export const FORECAST_VERSION = 1;

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** Older alarms count less: an alarm from half a year ago weighs half. */
const HALF_LIFE_DAYS = 180;
const TAU_DAYS = HALF_LIFE_DAYS / Math.LN2;

/**
 * Prior belief before any data: one alarm per fortnight, worth 14 days of
 * observation. Keeps the first weeks of a new account from swinging wildly.
 */
const PRIOR_ALARMS = 1;
const PRIOR_DAYS = 14;

/** Pseudo-alarms spread evenly over the day / week, so few alarms do not
 * produce a profile with hard zeros. */
const HOUR_PRIOR_ALARMS = 6;
const WEEKDAY_PRIOR_ALARMS = 7;
/** Each alarm is smeared over neighbouring hours with this spread. */
const HOUR_KERNEL_SIGMA = 1.5;

/** Hour-by-hour stepping covers two weeks, beyond that the daily pattern
 * averages out and the remainder is extrapolated with the mean rate. */
const STEP_HORIZON_HOURS = 14 * 24;

/** Below this many alarms the dashboard flags the forecast as rough. */
export const MIN_RELIABLE_ALARMS = 5;

export type RankedValue = { value: string; share: number };

export type ForecastModel = {
  fittedAt: number;
  firstAlarmAt: number;
  alarmCount: number;
  /** Recency-weighted alarm count at `fittedAt`, the first alarm excluded
   * because the observation window starts with it. */
  weightedAlarms: number;
  /** 24 shares, summing to 1, index = hour in German local time. */
  hourOfDay: number[];
  /** 7 shares, summing to 1, index = `Date#getDay()` in German local time. */
  dayOfWeek: number[];
  keyword: RankedValue | null;
  address: RankedValue | null;
};

export type Forecast = {
  computedAt: number;
  alarmsPerDay: number;
  /** Headline: the busiest hour around the median. */
  likely: number;
  /** Time by which the next alarm has happened with 25 / 50 / 75 % probability. */
  quartiles: { q25: number; q50: number; q75: number };
  within24h: number;
  within7d: number;
  ready: boolean;
};

const berlinFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
  weekday: "short",
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Hour (fractional) and weekday of a timestamp in German local time. */
export function berlinClock(ms: number) {
  const parts = berlinFormatter.formatToParts(new Date(ms));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return {
    hour: Number(part("hour")) + Number(part("minute")) / 60,
    weekday: WEEKDAYS.indexOf(part("weekday")),
  };
}

function recencyWeight(ageMs: number) {
  return Math.exp(-Math.max(0, ageMs) / DAY_MS / TAU_DAYS);
}

function rankValues(
  entries: { value: string; weight: number }[],
): RankedValue | null {
  const totals = new Map<string, number>();
  let sum = 0;

  for (const { value, weight } of entries) {
    const key = value.trim();
    if (!key) continue;
    totals.set(key, (totals.get(key) ?? 0) + weight);
    sum += weight;
  }

  let best: RankedValue | null = null;
  for (const [value, weight] of totals) {
    if (!best || weight / sum > best.share) {
      best = { value, share: weight / sum };
    }
  }

  return best;
}

export function fitModel(
  alarms: { date: string; keyword: string; address: string }[],
  now: number,
): ForecastModel | null {
  const sorted = alarms
    .map((alarm) => ({ ...alarm, at: new Date(alarm.date).getTime() }))
    .filter((alarm) => Number.isFinite(alarm.at))
    .sort((a, b) => a.at - b.at);
  const first = sorted[0];
  if (!first) return null;

  const hourCounts = new Array<number>(24).fill(0);
  const weekdayCounts = new Array<number>(7).fill(0);
  let totalWeight = 0;
  let weightedAlarms = 0;

  const weighted = sorted.map((alarm, index) => {
    const weight = recencyWeight(now - alarm.at);
    const { hour, weekday } = berlinClock(alarm.at);

    // Circular Gaussian over the hour bins, normalised so every alarm adds `weight`.
    const kernel = hourCounts.map((_, bin) => {
      const raw = Math.abs(bin + 0.5 - hour);
      const distance = Math.min(raw, 24 - raw);
      return Math.exp(-(distance ** 2) / (2 * HOUR_KERNEL_SIGMA ** 2));
    });
    const kernelSum = kernel.reduce((acc, value) => acc + value, 0);
    kernel.forEach((value, bin) => {
      hourCounts[bin] = (hourCounts[bin] ?? 0) + (weight * value) / kernelSum;
    });
    weekdayCounts[weekday] = (weekdayCounts[weekday] ?? 0) + weight;

    totalWeight += weight;
    if (index > 0) weightedAlarms += weight;

    return { ...alarm, weight };
  });

  return {
    fittedAt: now,
    firstAlarmAt: first.at,
    alarmCount: sorted.length,
    weightedAlarms,
    hourOfDay: hourCounts.map(
      (count) =>
        (count + HOUR_PRIOR_ALARMS / 24) / (totalWeight + HOUR_PRIOR_ALARMS),
    ),
    dayOfWeek: weekdayCounts.map(
      (count) =>
        (count + WEEKDAY_PRIOR_ALARMS / 7) /
        (totalWeight + WEEKDAY_PRIOR_ALARMS),
    ),
    keyword: rankValues(
      weighted.map((alarm) => ({ value: alarm.keyword, weight: alarm.weight })),
    ),
    address: rankValues(
      weighted.map((alarm) => ({ value: alarm.address, weight: alarm.weight })),
    ),
  };
}

/**
 * Alarms per day at `now`. Both the weighted alarm count and the weighted
 * observation time decay with age, so a quiet stretch after the fit lowers the
 * rate without re-reading any alarm.
 */
export function alarmsPerDay(model: ForecastModel, now: number) {
  const decay = recencyWeight(now - model.fittedAt);
  const observedDays = TAU_DAYS * (1 - recencyWeight(now - model.firstAlarmAt));

  return (
    (PRIOR_ALARMS + model.weightedAlarms * decay) / (PRIOR_DAYS + observedDays)
  );
}

/** How much busier than average the hour around `ms` is. 168 * hourShare *
 * weekdayShare averages to 1 over a week. */
function profileAt(model: ForecastModel, ms: number) {
  const { hour, weekday } = berlinClock(ms);

  return (
    168 *
    (model.hourOfDay[Math.floor(hour)] ?? 1 / 24) *
    (model.dayOfWeek[weekday] ?? 1 / 7)
  );
}

/**
 * The median alone lands at a random time of day: it is wherever the
 * cumulative probability crosses 50 %. For a readable "Sa gegen 17 Uhr" pick
 * the busiest hour within half a day of it instead, never in the past.
 */
function likeliestHourNear(model: ForecastModel, median: number, now: number) {
  const hourStart = (ms: number) => Math.floor(ms / HOUR_MS) * HOUR_MS;
  let best = Math.max(now, median);
  let bestProfile = -1;

  for (let offset = -12; offset <= 12; offset++) {
    const start = hourStart(median) + offset * HOUR_MS;
    if (start + HOUR_MS <= now) continue;
    const profile = profileAt(model, start + HOUR_MS / 2);
    if (profile > bestProfile) {
      bestProfile = profile;
      best = Math.max(now, start + HOUR_MS / 2);
    }
  }

  return best;
}

export function projectForecast(model: ForecastModel, now: number): Forecast {
  const perDay = alarmsPerDay(model, now);
  const targets = [0.25, 0.5, 0.75].map((p) => -Math.log(1 - p));
  const hits: (number | undefined)[] = [];
  let hazard = 0;
  let within24h = 0;
  let within7d = 0;

  for (let step = 0; step < STEP_HORIZON_HOURS; step++) {
    const start = now + step * HOUR_MS;
    const perHour = (perDay / 24) * profileAt(model, start + HOUR_MS / 2);

    targets.forEach((target, index) => {
      if (hits[index] === undefined && hazard + perHour >= target) {
        hits[index] = start + ((target - hazard) / perHour) * HOUR_MS;
      }
    });

    hazard += perHour;
    if (step === 23) within24h = 1 - Math.exp(-hazard);
    if (step === 7 * 24 - 1) within7d = 1 - Math.exp(-hazard);
  }

  // Past the stepped horizon the weekly pattern averages to the mean rate.
  const horizonEnd = now + STEP_HORIZON_HOURS * HOUR_MS;
  const [q25, q50, q75] = targets.map(
    (target, index) =>
      hits[index] ?? horizonEnd + ((target - hazard) / perDay) * DAY_MS,
  ) as [number, number, number];

  return {
    computedAt: now,
    alarmsPerDay: perDay,
    likely: likeliestHourNear(model, q50, now),
    quartiles: { q25, q50, q75 },
    within24h,
    within7d,
    ready: model.alarmCount >= MIN_RELIABLE_ALARMS,
  };
}
