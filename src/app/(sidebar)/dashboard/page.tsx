import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  TimeOfDayChart,
  ZeitChart,
  GonePieChart,
} from "~/app/(sidebar)/dashboard/zeit_chart";
import { fetchQuery } from "convex/nextjs";
import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
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

async function Page() {
  const stats = await fetchQuery(
    api.stats.get,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
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
              stats={stats.times.map((v, i) => ({ value: v, index: i + 1 }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Einsatz-Tageszeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeOfDayChart
              stats={Array.from({ length: 24 }, (_, v) => ({
                timeOfDay: v,
                value: hoursOfDay.filter((h) => h === v).length ?? 0,
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
              {stats.positions.map((pos) => (
                <VehicleName
                  count={pos.count}
                  position={pos.seat}
                  vehicleId={pos.vehicle}
                  key={`${pos.vehicle}-${pos.seat}`}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
