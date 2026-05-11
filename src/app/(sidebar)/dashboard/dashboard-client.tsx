"use client";

import React, { useMemo } from "react";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "#/_generated/api";
import type { Doc, Id } from "#/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  GonePieChart,
  TimeOfDayChart,
  ZeitChart,
} from "~/app/(sidebar)/dashboard/zeit_chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import VehicleName from "~/app/_components/vehicle-name";
import {
  Activity,
  CalendarClock,
  Clock3,
  MapPin,
  Radio,
  Target,
  TrendingUp,
} from "lucide-react";

type Alarm = Doc<"alarms">;

const dayFormatter = new Intl.DateTimeFormat("de", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("de", {
  hour: "2-digit",
  minute: "2-digit",
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

function StatTile({
  label,
  value,
  helper,
  icon: Icon,
}: Readonly<{
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}>) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-red-600">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {helper}
          </p>
        </div>
        <div className="rounded-md bg-red-50 p-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function RankedTable({
  title,
  rows,
  firstColumn,
}: Readonly<{
  title: string;
  rows: { label: string; count: number }[];
  firstColumn: string;
}>) {
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{firstColumn}</TableHead>
              <TableHead className="w-28 text-right">Anzahl</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 6).map((row) => (
              <TableRow key={row.label}>
                <TableCell>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium">{row.label}</span>
                    <Progress value={(row.count / max) * 100} className="h-1" />
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {numberFormatter.format(row.count)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
  const hoursOfDay = stats.timesOfAlarms.map((alarm) =>
    Number(
      new Intl.DateTimeFormat("de", { hour: "2-digit" })
        .format(new Date(alarm))
        .substring(0, 2),
    ),
  );
  const attendedRate =
    stats.totalCount > 0 ? (stats.goneCount / stats.totalCount) * 100 : 0;
  const lastAlarmAge = daysSince(stats.currentTime);
  const predictedKeyword =
    stats.prediction.predictedKeyword?.value ?? "Unbekannt";
  const predictedAddress =
    stats.prediction.predictedAddress?.value ?? "Keine Adresse erkannt";

  return (
    <div className="space-y-4 p-4">
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Aufgezeichnete Einsätze"
          value={numberFormatter.format(stats.totalCount)}
          helper="Basis für Statistik und Prognose"
          icon={Radio}
        />
        <StatTile
          label="Durchschnittlicher Abstand"
          value={`${numberFormatter.format(stats.avgTime)} Tage`}
          helper={`Spanne ${numberFormatter.format(stats.minTime)} bis ${numberFormatter.format(stats.maxTime)} Tage`}
          icon={TrendingUp}
        />
        <StatTile
          label="Seit letztem Einsatz"
          value={`${numberFormatter.format(lastAlarmAge)} Tage`}
          helper={
            stats.currentTime
              ? dayFormatter.format(new Date(stats.currentTime))
              : "Noch kein Einsatz"
          }
          icon={Clock3}
        />
        <StatTile
          label="Gegangen"
          value={`${numberFormatter.format(attendedRate)} %`}
          helper={`${numberFormatter.format(stats.goneCount)} von ${numberFormatter.format(stats.totalCount)}`}
          icon={Activity}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-red-200 dark:border-red-950">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-5 text-red-600" />
                Prognose nächster Einsatz
              </CardTitle>
              <Badge variant="secondary">
                {stats.prediction.confidence}% Modellvertrauen
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Berechnet aus Abständen, Wochentagen, Uhrzeiten, Stichwörtern und
              Adressen der bisherigen Einsätze.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {stats.prediction.dates.map((prediction, index) => {
                const date = new Date(prediction.date);

                return (
                  <div
                    className="bg-muted/30 rounded-md border p-4"
                    key={prediction.date}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {prediction.confidence}%
                      </span>
                    </div>
                    <p className="mt-4 text-xl font-semibold">
                      {dayFormatter.format(date)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      gegen {timeFormatter.format(date)} Uhr
                    </p>
                    <p className="text-muted-foreground mt-3 text-xs">
                      {prediction.reason}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-red-50 p-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  <Target className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-sm">
                    Wahrscheinliches Stichwort
                  </p>
                  <p className="truncate font-semibold">{predictedKeyword}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-red-50 p-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-sm">
                    Wahrscheinlicher Ort
                  </p>
                  <p className="truncate font-semibold">{predictedAddress}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prognose-Signale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.prediction.signals.map((signal) => (
              <div className="space-y-2" key={signal.label}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{signal.label}</span>
                  <span className="font-medium tabular-nums">
                    {numberFormatter.format(signal.value)} Tage
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    (signal.value / (stats.maxTime || 1)) * 100,
                  )}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Zeit zwischen Einsätzen</CardTitle>
          </CardHeader>
          <CardContent>
            <ZeitChart
              stats={stats.times.map((value, index) => ({
                value,
                index: index + 1,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Einsatz-Tageszeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeOfDayChart
              stats={Array.from({ length: 24 }, (_, value) => ({
                timeOfDay: value,
                value: hoursOfDay.filter((hour) => hour === value).length ?? 0,
              }))}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Anteile</CardTitle>
          </CardHeader>
          <CardContent>
            <GonePieChart gone={stats.goneCount} notGone={stats.notGoneCount} />
          </CardContent>
        </Card>
        <RankedTable
          title="Häufigste Orte"
          firstColumn="Ort"
          rows={stats.locations.map((location) => ({
            label: location.address,
            count: location.count,
          }))}
        />
        <RankedTable
          title="Häufigste Stichwörter"
          firstColumn="Stichwort"
          rows={stats.keywords.map((keyword) => ({
            label: keyword.keyword,
            count: keyword.count,
          }))}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Häufigste Positionen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fahrzeug</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Anzahl</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.positions.map((position) => (
                <VehicleName
                  count={position.count}
                  position={position.seat}
                  vehicleId={position.vehicle}
                  key={`${position.vehicle}-${position.seat}`}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
