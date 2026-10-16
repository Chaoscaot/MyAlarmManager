"use client";

import Link from "next/link";
import type { Doc } from "#/_generated/dataModel";
import {
  PagerCursor,
  PagerDisplay,
  PagerLine,
} from "~/app/_components/pager-display";
import { seatName, useVehicle } from "~/app/_components/vehicle-name";

type Forecast = {
  ready: boolean;
  dates: { date: string; confidence: number; reason: string }[];
  predictedKeyword: { value: string } | null;
  predictedAddress: { value: string } | null;
};

const stampFormatter = new Intl.DateTimeFormat("de", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const forecastDayFormatter = new Intl.DateTimeFormat("de", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("de", {
  hour: "2-digit",
  minute: "2-digit",
});

function VehicleLine({
  alarm,
  line,
}: Readonly<{ alarm: Doc<"alarms">; line: number }>) {
  const vehicle = useVehicle(alarm.vehicleId);

  if (!alarm.gone) {
    return (
      <PagerLine line={line} className="mt-2 text-sm opacity-70">
        Nicht ausgerückt
      </PagerLine>
    );
  }

  // Vehicle still loading: keep the line's height so the layout does not jump.
  if (vehicle === undefined) {
    return (
      <PagerLine line={line} className="mt-2 text-sm opacity-70">
        &nbsp;
      </PagerLine>
    );
  }

  if (vehicle === null) {
    return (
      <PagerLine line={line} className="mt-2 text-sm opacity-70">
        Ausgerückt, Fahrzeug nicht eingetragen
      </PagerLine>
    );
  }

  return (
    <PagerLine line={line} className="mt-2 text-sm opacity-80">
      {vehicle.callSign || vehicle.name} · {seatName(vehicle, alarm.seat)}
    </PagerLine>
  );
}

function EmptyPager() {
  return (
    <div className="flex flex-col gap-3">
      <PagerDisplay label="Letzte Meldung" status="--.--.-- --:--">
        <PagerLine line={0} className="text-2xl leading-tight md:text-3xl">
          NOCH KEINE MELDUNG
        </PagerLine>
        <PagerLine line={1} className="mt-3 text-sm opacity-80">
          Alarme kommen per Webhook von Alamos.
        </PagerLine>
        <PagerLine line={2} className="mt-1 text-sm opacity-80">
          Webhook unter Einstellungen anlegen
          <PagerCursor />
        </PagerLine>
      </PagerDisplay>
      <p className="text-muted-foreground px-2 text-sm">
        Legen Sie in den{" "}
        <Link
          href="/settings"
          className="text-foreground focus-visible:ring-ring/50 rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]"
        >
          Einstellungen
        </Link>{" "}
        einen Webhook an und tragen Sie die Adresse in Alamos ein.
      </p>
    </div>
  );
}

/** Dashboard hero: the last alarm as a pager message, followed by the forecast. */
export default function AlarmPager({
  lastAlarm,
  forecast,
}: Readonly<{
  lastAlarm: Doc<"alarms"> | null;
  forecast: Forecast;
}>) {
  if (!lastAlarm) return <EmptyPager />;

  const keyword = forecast.predictedKeyword?.value;
  const address = forecast.predictedAddress?.value;
  // Lines 0-2 are the alarm, 3 the forecast heading, then one line per date.
  const afterDates = 4 + forecast.dates.length;

  return (
    <PagerDisplay
      label="Letzte Meldung"
      status={stampFormatter.format(new Date(lastAlarm.date)).replace(",", "")}
    >
      <PagerLine
        line={0}
        className="text-2xl leading-tight [overflow-wrap:anywhere] uppercase md:text-3xl"
      >
        {lastAlarm.keyword || "Ohne Stichwort"}
      </PagerLine>
      <PagerLine
        line={1}
        className="mt-1 text-base [overflow-wrap:anywhere] opacity-90"
      >
        {lastAlarm.address || "Keine Adresse übermittelt"}
      </PagerLine>
      <VehicleLine alarm={lastAlarm} line={2} />

      <div
        aria-hidden
        className="border-amber/25 my-5 border-t border-dashed"
      />

      <PagerLine line={3} className="text-xs tracking-[0.2em] opacity-70">
        <h2>PROGNOSE NÄCHSTER EINSATZ</h2>
      </PagerLine>

      <ol className="mt-2 space-y-1">
        {forecast.dates.map((prediction, index) => {
          const date = new Date(prediction.date);

          return (
            <li key={prediction.date} title={prediction.reason}>
              <PagerLine
                line={4 + index}
                className={
                  index === 0
                    ? "grid grid-cols-[1.25rem_1fr_auto] gap-x-2 text-base"
                    : "grid grid-cols-[1.25rem_1fr_auto] gap-x-2 text-sm opacity-75"
                }
              >
                <span aria-hidden>{index + 1}</span>
                <span className="tabular-nums">
                  {forecastDayFormatter.format(date)}{" "}
                  <span className="sr-only">gegen </span>
                  {timeFormatter.format(date)}
                  <span className="sr-only"> Uhr</span>
                </span>
                <span className="text-right tabular-nums">
                  <span className="sr-only">Vertrauen </span>
                  {prediction.confidence}%
                </span>
              </PagerLine>
            </li>
          );
        })}
      </ol>

      <dl className="mt-4 space-y-1 text-sm">
        <PagerLine
          line={afterDates}
          className="grid grid-cols-[6.5rem_1fr] gap-x-2"
        >
          <dt className="opacity-60">Stichwort</dt>
          <dd className="[overflow-wrap:anywhere]">{keyword ?? "unbekannt"}</dd>
        </PagerLine>
        <PagerLine
          line={afterDates + 1}
          className="grid grid-cols-[6.5rem_1fr] gap-x-2"
        >
          <dt className="opacity-60">Ort</dt>
          <dd className="[overflow-wrap:anywhere]">
            {address ?? "unbekannt"}
            <PagerCursor />
          </dd>
        </PagerLine>
      </dl>

      {!forecast.ready ? (
        <PagerLine line={afterDates + 2} className="mt-3 text-xs opacity-60">
          Erst ein Einsatz erfasst, Prognose ungenau
        </PagerLine>
      ) : null}
    </PagerDisplay>
  );
}
