"use client";

import React, { useMemo } from "react";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "#/_generated/api";
import type { Doc, Id } from "#/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import PageHeader from "~/app/_components/page-header";
import VehicleName from "~/app/_components/vehicle-name";
import AlarmPager from "~/app/(sidebar)/dashboard/alarm-pager";
import { RankedCard, RankedRow } from "~/app/(sidebar)/dashboard/ranked-list";
import {
  GoneSplit,
  TimeOfDayChart,
  ZeitChart,
} from "~/app/(sidebar)/dashboard/zeit_chart";

type Alarm = Doc<"alarms">;

const dayFormatter = new Intl.DateTimeFormat("de", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const numberFormatter = new Intl.NumberFormat("de", {
  maximumFractionDigits: 1,
});

function daysSince(date: string | null) {
  if (!date) return 0;

  return (
    (new Date().getTime() - new Date(date).getTime()) / 1000 / 60 / 60 / 24
  );
}

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

        acc[value] ??= {
          value,
          count: 0,
          lastSeen: alarm.date,
          score: 0,
        };

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

function calculateStats(alarms: Alarm[]) {
  const sortedAlarms = [...alarms].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const intervals = sortedAlarms
    .map((alarm, index) => {
      if (index === 0 || !alarm.date) return null;
      const previousAlarm = sortedAlarms[index - 1];
      if (!previousAlarm?.date) return null;

      return (
        (new Date(alarm.date).getTime() -
          new Date(previousAlarm.date).getTime()) /
        1000 /
        60 /
        60 /
        24
      );
    })
    .filter((time): time is number => time !== null);

  const avgTime =
    intervals.reduce((acc, time) => acc + time, 0) / intervals.length || 0;
  const minTime = intervals.length > 0 ? Math.min(...intervals) : 0;
  const maxTime = intervals.length > 0 ? Math.max(...intervals) : 0;
  const currentTime =
    sortedAlarms.length > 0
      ? new Date(sortedAlarms[sortedAlarms.length - 1]!.date).toISOString()
      : null;

  const positions = Object.values(
    sortedAlarms
      .filter((alarm) => alarm.vehicleId && alarm.seat)
      .map((alarm) => ({
        vehicle: alarm.vehicleId!,
        seat: alarm.seat,
      }))
      .reduce(
        (acc, curr) => {
          const key = `${curr.vehicle}-${curr.seat}`;
          acc[key] ??= { ...curr, count: 0 };
          acc[key].count++;
          return acc;
        },
        {} as Record<
          string,
          { vehicle: Id<"vehicles">; seat: number; count: number }
        >,
      ),
  ).sort((a, b) => b.count - a.count);

  const locations = Object.entries(
    sortedAlarms
      .map((alarm) => alarm.address)
      .filter((address) => address)
      .reduce(
        (acc, address) => {
          acc[address] = (acc[address] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
  )
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count);

  const keywords = Object.entries(
    sortedAlarms
      .map((alarm) => alarm.keyword)
      .filter((keyword) => keyword)
      .reduce(
        (acc, keyword) => {
          acc[keyword] = (acc[keyword] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
  )
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);

  const timesOfAlarms = sortedAlarms
    .map((alarm) => alarm.date)
    .filter((date) => date !== null);
  const goneCount = sortedAlarms.filter((alarm) => alarm.gone === true).length;
  const notGoneCount = sortedAlarms.length - goneCount;

  return {
    avgTime,
    minTime,
    maxTime,
    currentTime,
    times: intervals,
    positions,
    locations,
    keywords,
    timesOfAlarms,
    goneCount,
    notGoneCount,
    totalCount: sortedAlarms.length,
    prediction: getPrediction(sortedAlarms, intervals, avgTime),
  };
}

const monthFormatter = new Intl.DateTimeFormat("de", {
  month: "long",
  year: "numeric",
});

function KeyFigure({
  label,
  value,
  unit,
  helper,
}: Readonly<{
  label: string;
  value: string;
  unit?: string;
  helper: string;
}>) {
  return (
    <div className="bg-background flex min-w-0 flex-col justify-center px-4 py-4 md:px-5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="mt-1">
        <span className="font-display text-4xl leading-none font-semibold tabular-nums md:text-5xl">
          {value}
        </span>
        {unit ? (
          <span className="text-muted-foreground ml-1.5 text-sm">{unit}</span>
        ) : null}
      </dd>
      <dd className="text-muted-foreground mt-1.5 truncate text-xs tabular-nums">
        {helper}
      </dd>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <Card className="min-w-0 gap-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      <CardContent className="pr-3 pl-1 md:pr-4 md:pl-2">
        {children}
      </CardContent>
    </Card>
  );
}

export default function DashboardClient({
  preloadedAlarms,
}: Readonly<{
  preloadedAlarms: Preloaded<typeof api.stats.get>;
}>) {
  const alarms = usePreloadedQuery(preloadedAlarms);
  const stats = useMemo(() => calculateStats(alarms ?? []), [alarms]);
  const lastAlarm = useMemo(
    () =>
      (alarms ?? []).reduce<Alarm | null>(
        (latest, alarm) =>
          !latest || new Date(alarm.date) > new Date(latest.date)
            ? alarm
            : latest,
        null,
      ),
    [alarms],
  );
  const hoursOfDay = stats.timesOfAlarms.map((alarm) =>
    Number(
      new Intl.DateTimeFormat("de", { hour: "2-digit" })
        .format(new Date(alarm))
        .substring(0, 2),
    ),
  );
  const attendedRate =
    stats.totalCount > 0 ? (stats.goneCount / stats.totalCount) * 100 : 0;
  const lastAlarmAge = Math.floor(daysSince(stats.currentTime));
  const firstAlarmDate = stats.timesOfAlarms[0];
  const hasIntervals = stats.times.length > 0;
  const placeholder = "–";

  const meta =
    stats.totalCount === 0
      ? "Noch keine Einsätze erfasst"
      : `${numberFormatter.format(stats.totalCount)} ${stats.totalCount === 1 ? "Einsatz" : "Einsätze"} seit ${monthFormatter.format(new Date(firstAlarmDate!))}`;

  const locationMax = stats.locations[0]?.count ?? 1;
  const keywordMax = stats.keywords[0]?.count ?? 1;
  const positionMax = stats.positions[0]?.count ?? 1;

  return (
    <>
      <PageHeader title="Statistiken" meta={meta} />

      <div className="space-y-6 px-4 md:px-6">
        <section
          aria-label="Letzte Meldung und Kennzahlen"
          className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          <div className="min-w-0 lg:col-span-7">
            <AlarmPager lastAlarm={lastAlarm} forecast={stats.prediction} />
          </div>

          <dl className="bg-border grid grid-cols-2 gap-px self-start overflow-hidden rounded-lg border lg:col-span-5 lg:auto-rows-fr lg:grid-cols-1 lg:self-stretch">
            <KeyFigure
              label="Einsätze"
              value={numberFormatter.format(stats.totalCount)}
              helper={
                firstAlarmDate
                  ? `seit ${monthFormatter.format(new Date(firstAlarmDate))}`
                  : "noch keine erfasst"
              }
            />
            <KeyFigure
              label="Ø Abstand"
              value={
                hasIntervals
                  ? numberFormatter.format(stats.avgTime)
                  : placeholder
              }
              unit={hasIntervals ? "Tage" : undefined}
              helper={
                hasIntervals
                  ? `Spanne ${numberFormatter.format(stats.minTime)}–${numberFormatter.format(stats.maxTime)} Tage`
                  : "ab zwei Einsätzen"
              }
            />
            <KeyFigure
              label="Seit letztem Einsatz"
              value={
                stats.currentTime
                  ? numberFormatter.format(lastAlarmAge)
                  : placeholder
              }
              unit={
                stats.currentTime
                  ? lastAlarmAge === 1
                    ? "Tag"
                    : "Tage"
                  : undefined
              }
              helper={
                stats.currentTime
                  ? dayFormatter.format(new Date(stats.currentTime))
                  : "noch kein Einsatz"
              }
            />
            <KeyFigure
              label="Anteil gegangen"
              value={
                stats.totalCount > 0
                  ? numberFormatter.format(attendedRate)
                  : placeholder
              }
              unit={stats.totalCount > 0 ? "%" : undefined}
              helper={`${numberFormatter.format(stats.goneCount)} von ${numberFormatter.format(stats.totalCount)}`}
            />
          </dl>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="Zeit zwischen Einsätzen"
            description="Abstand in Tagen, chronologisch"
          >
            <ZeitChart
              stats={stats.times.map((value, index) => ({
                value,
                index: index + 1,
              }))}
            />
          </ChartCard>
          <ChartCard
            title="Einsatz-Tageszeiten"
            description="Einsätze je Stunde des Tages"
          >
            <TimeOfDayChart
              stats={Array.from({ length: 24 }, (_, value) => ({
                timeOfDay: value,
                value: hoursOfDay.filter((hour) => hour === value).length ?? 0,
              }))}
            />
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <RankedCard
            title="Häufigste Orte"
            isEmpty={stats.locations.length === 0}
          >
            {stats.locations.slice(0, 6).map((location) => (
              <RankedRow
                key={location.address}
                label={location.address}
                count={location.count}
                max={locationMax}
              />
            ))}
          </RankedCard>
          <RankedCard
            title="Häufigste Stichwörter"
            isEmpty={stats.keywords.length === 0}
          >
            {stats.keywords.slice(0, 6).map((keyword) => (
              <RankedRow
                key={keyword.keyword}
                label={
                  <span className="font-display text-base tracking-wide">
                    {keyword.keyword}
                  </span>
                }
                count={keyword.count}
                max={keywordMax}
              />
            ))}
          </RankedCard>
          <div className="flex min-w-0 flex-col gap-6 md:col-span-2 md:grid md:grid-cols-2 xl:col-span-1 xl:flex">
            <Card className="gap-4">
              <CardHeader>
                <CardTitle>Anteile</CardTitle>
              </CardHeader>
              <CardContent>
                <GoneSplit
                  gone={stats.goneCount}
                  notGone={stats.notGoneCount}
                />
              </CardContent>
            </Card>
            <RankedCard
              title="Häufigste Positionen"
              isEmpty={stats.positions.length === 0}
            >
              {stats.positions.slice(0, 6).map((position) => (
                <RankedRow
                  key={`${position.vehicle}-${position.seat}`}
                  label={
                    <VehicleName
                      vehicleId={position.vehicle}
                      position={position.seat}
                    />
                  }
                  count={position.count}
                  max={positionMax}
                />
              ))}
            </RankedCard>
          </div>
        </section>
      </div>
    </>
  );
}
