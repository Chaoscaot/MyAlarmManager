import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

type Alarm = Doc<"alarms">;

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  }

  return sorted[middle] ?? 0;
}

function weightedAverage(values: number[]) {
  const weightSum = values.reduce((acc, _value, index) => acc + index + 1, 0);
  const valueSum = values.reduce(
    (acc, value, index) => acc + value * (index + 1),
    0,
  );

  return weightSum === 0 ? 0 : valueSum / weightSum;
}

function circularHourAverage(alarms: Alarm[]) {
  if (alarms.length === 0) return 12;

  const result = alarms.reduce(
    (acc, alarm, index) => {
      const date = new Date(alarm.date);
      const hour = date.getHours() + date.getMinutes() / 60;
      const angle = (hour / 24) * 2 * Math.PI;
      const weight = index + 1;

      return {
        sin: acc.sin + Math.sin(angle) * weight,
        cos: acc.cos + Math.cos(angle) * weight,
        weight: acc.weight + weight,
      };
    },
    { sin: 0, cos: 0, weight: 0 },
  );

  const angle = Math.atan2(
    result.sin / result.weight,
    result.cos / result.weight,
  );
  const normalized = angle < 0 ? angle + 2 * Math.PI : angle;

  return (normalized / (2 * Math.PI)) * 24;
}

function mode<T extends string | number>(values: T[]) {
  const counts = values.reduce(
    (acc, value) => {
      const key = String(value);

      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const [value] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? [];

  return value as T | undefined;
}

function getRankedStringValue(alarms: Alarm[], key: "keyword" | "address") {
  const now = Date.now();

  return Object.values(
    alarms.reduce(
      (acc, alarm, index) => {
        const value = alarm[key]?.trim();
        if (!value) return acc;

        const ageInDays = Math.max(
          0,
          (now - new Date(alarm.date).getTime()) / 1000 / 60 / 60 / 24,
        );
        const recencyScore = 1 / (ageInDays / 30 + 1);
        const recentScore = index >= alarms.length - 10 ? 0.75 : 0;

        if (!acc[value]) {
          acc[value] = {
            value,
            count: 0,
            lastSeen: alarm.date,
            score: 0,
          };
        }

        acc[value].count++;
        acc[value].lastSeen =
          new Date(alarm.date) > new Date(acc[value].lastSeen)
            ? alarm.date
            : acc[value].lastSeen;
        acc[value].score += 1 + recencyScore + recentScore;

        return acc;
      },
      {} as Record<
        string,
        { value: string; count: number; lastSeen: string; score: number }
      >,
    ),
  ).sort((a, b) => b.score - a.score || b.count - a.count);
}

function setPredictedTime(date: Date, hour: number) {
  const predicted = new Date(date);
  const wholeHour = Math.floor(hour);
  const minutes = Math.round((hour - wholeHour) * 60);

  predicted.setHours(wholeHour, minutes, 0, 0);
  return predicted;
}

function ensureFuture(date: Date, intervalDays: number) {
  const next = new Date(date);
  const stepMs = Math.max(1, intervalDays) * 24 * 60 * 60 * 1000;

  while (next.getTime() <= Date.now()) {
    next.setTime(next.getTime() + stepMs);
  }

  return next;
}

function dateNearWeekday(target: Date, weekday?: string | number) {
  if (weekday === undefined) return target;

  const result = new Date(target);
  const targetWeekday =
    typeof weekday === "string" ? Number.parseInt(weekday, 10) : weekday;
  let bestOffset = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let offset = -3; offset <= 3; offset++) {
    const candidate = new Date(target);
    candidate.setDate(candidate.getDate() + offset);
    const distance =
      candidate.getDay() === targetWeekday
        ? Math.abs(offset)
        : Number.POSITIVE_INFINITY;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = offset;
    }
  }

  result.setDate(result.getDate() + bestOffset);
  return result;
}

function getPrediction(alarms: Alarm[], intervals: number[], avgTime: number) {
  if (alarms.length === 0) {
    return {
      ready: false,
      confidence: 0,
      predictedKeyword: null,
      predictedAddress: null,
      predictedHour: null,
      dates: [],
      signals: [],
    };
  }

  const lastAlarm = alarms[alarms.length - 1]!;
  const recentIntervals = intervals.slice(-8);
  const recentAvg = weightedAverage(recentIntervals);
  const medianTime = median(intervals);
  const predictedInterval =
    intervals.length === 0
      ? 7
      : recentAvg * 0.5 + avgTime * 0.3 + medianTime * 0.2;
  const predictedHour = circularHourAverage(alarms.slice(-12));
  const frequentWeekday = mode(
    alarms.map((alarm) => new Date(alarm.date).getDay()),
  );
  const keywordRanking = getRankedStringValue(alarms, "keyword");
  const addressRanking = getRankedStringValue(alarms, "address");
  const baseDate = setPredictedTime(
    ensureFuture(
      new Date(
        new Date(lastAlarm.date).getTime() +
          predictedInterval * 24 * 60 * 60 * 1000,
      ),
      predictedInterval,
    ),
    predictedHour,
  );
  const cadenceDate = setPredictedTime(
    ensureFuture(
      new Date(
        new Date(lastAlarm.date).getTime() + recentAvg * 24 * 60 * 60 * 1000,
      ),
      recentAvg || predictedInterval,
    ),
    predictedHour,
  );
  const weekdayDate = setPredictedTime(
    ensureFuture(dateNearWeekday(baseDate, frequentWeekday), predictedInterval),
    predictedHour,
  );

  const uniqueDates = [baseDate, weekdayDate, cadenceDate]
    .sort((a, b) => a.getTime() - b.getTime())
    .reduce<Date[]>((acc, date) => {
      const isDuplicate = acc.some(
        (existing) =>
          Math.abs(existing.getTime() - date.getTime()) < 12 * 60 * 60 * 1000,
      );

      if (!isDuplicate) acc.push(date);
      return acc;
    }, []);

  while (uniqueDates.length < 3) {
    const previous = uniqueDates[uniqueDates.length - 1] ?? baseDate;
    uniqueDates.push(
      setPredictedTime(
        new Date(
          previous.getTime() +
            Math.max(1, predictedInterval) * 24 * 60 * 60 * 1000,
        ),
        predictedHour,
      ),
    );
  }

  const confidence = Math.min(
    92,
    Math.max(
      18,
      Math.round(
        alarms.length * 3 +
          Math.max(0, 30 - Math.abs((recentAvg || avgTime) - avgTime) * 3),
      ),
    ),
  );

  return {
    ready: alarms.length >= 2,
    confidence,
    predictedKeyword: keywordRanking[0] ?? null,
    predictedAddress: addressRanking[0] ?? null,
    predictedHour,
    dates: uniqueDates.slice(0, 3).map((date, index) => ({
      date: date.toISOString(),
      confidence: Math.max(10, confidence - index * 12),
      reason:
        index === 0
          ? "Gewichteter Abstand der letzten Einsätze"
          : index === 1
            ? "Häufigster Wochentag und typische Uhrzeit"
            : "Aktuelle Einsatz-Kadenz",
    })),
    signals: [
      { label: "Historischer Abstand", value: avgTime },
      { label: "Aktuelle Kadenz", value: recentAvg || avgTime },
      { label: "Median-Abstand", value: medianTime },
    ],
  };
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const all = await ctx.db
      .query("alarms")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const result = all
      .map((alarm, index) => {
        if (index === 0 || !alarm.date) return null; // Skip invalid entries
        const prevAlarm = all[index - 1];
        if (!prevAlarm?.date) return null; // Skip if previous alarm's date is invalid
        return (
          (new Date(alarm.date).getTime() -
            new Date(prevAlarm.date).getTime()) /
          1000 /
          60 /
          60 /
          24
        );
      })
      .filter((time): time is number => time !== null); // Filter out null values

    const avgTime =
      result.reduce((acc, time) => acc + time, 0) / result.length || 0;
    const minTime = result.length > 0 ? Math.min(...result) : 0;
    const maxTime = result.length > 0 ? Math.max(...result) : 0;
    const currentTime =
      all.length > 0 ? new Date(all[all.length - 1]!.date).toISOString() : null;

    const positions = Object.values(
      all
        .filter((alarm) => alarm.vehicleId && alarm.seat)
        .map((alarm) => ({
          vehicle: alarm.vehicleId!,
          seat: alarm.seat,
        }))
        .reduce(
          (acc, curr) => {
            const key = `${curr.vehicle}-${curr.seat}`;
            if (!acc[key]) {
              acc[key] = { ...curr, count: 0 };
            }
            acc[key].count++;
            return acc;
          },
          {} as Record<
            string,
            { vehicle: Id<"vehicles">; seat: number; count: number }
          >,
        ),
    );

    positions.sort((a, b) => b.count - a.count);

    const locations = Object.entries(
      all
        .map((alarm) => alarm.address)
        .filter((address) => address)
        .reduce(
          (acc, address) => {
            acc[address] = (acc[address] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
    ).map(([address, count]) => ({ address, count }));

    locations.sort((a, b) => b.count - a.count);

    const keywords = Object.entries(
      all
        .map((alarm) => alarm.keyword)
        .filter((keyword) => keyword)
        .reduce(
          (acc, keyword) => {
            acc[keyword] = (acc[keyword] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
    ).map(([keyword, count]) => ({ keyword, count }));

    keywords.sort((a, b) => b.count - a.count);

    const times = all
      .map((alarm) => alarm.date)
      .filter((date) => date !== null);

    // Count gone vs not gone
    const goneCount = all.filter((a) => a.gone === true).length;
    const notGoneCount = all.length - goneCount;

    return {
      avgTime,
      minTime,
      maxTime,
      currentTime,
      times: result,
      positions,
      locations,
      keywords,
      timesOfAlarms: times,
      goneCount,
      notGoneCount,
      totalCount: all.length,
      prediction: getPrediction(all, result, avgTime),
    };
  },
});
