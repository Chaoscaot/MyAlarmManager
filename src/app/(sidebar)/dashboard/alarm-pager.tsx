"use client";

import Link from "next/link";
import type { FunctionReturnType } from "convex/server";
import type { api } from "#/_generated/api";
import type { Doc } from "#/_generated/dataModel";
import {
  PagerCursor,
  PagerDisplay,
  PagerLine,
} from "~/app/_components/pager-display";
import { seatName, useVehicle } from "~/app/_components/vehicle-name";

type StoredForecast = FunctionReturnType<typeof api.forecast.get>;

const stampFormatter = new Intl.DateTimeFormat("de", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

// Forecast times are pinned to German time so server and browser render alike.
const forecastDayFormatter = new Intl.DateTimeFormat("de", {
  timeZone: "Europe/Berlin",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const forecastHourFormatter = new Intl.DateTimeFormat("de", {
  timeZone: "Europe/Berlin",
  hour: "numeric",
  hourCycle: "h23",
});

/** "5", not "05": browsers disagree on padding for the German hour. */
function hourNumber(ms: number) {
  return Number(
    forecastHourFormatter.formatToParts(ms).find((part) => part.type === "hour")
      ?.value,
  );
}

const percentFormatter = new Intl.NumberFormat("de", {
  style: "percent",
  maximumFractionDigits: 0,
});

function formatChance(probability: number) {
  if (probability < 0.01) return "unter 1 %";
  if (probability > 0.99) return "über 99 %";
  return percentFormatter.format(probability);
}

function formatSpan(from: number, to: number) {
  const fromDay = forecastDayFormatter.format(from);
  const toDay = forecastDayFormatter.format(to);

  return fromDay === toDay
    ? `${fromDay} ${hourNumber(from)}–${hourNumber(to)} Uhr`
    : `${fromDay} – ${toDay}`;
}

function ForecastRow({
  line,
  term,
  title,
  children,
}: Readonly<{
  line: number;
  term: string;
  title?: string;
  children: React.ReactNode;
}>) {
  return (
    <PagerLine line={line} className="grid grid-cols-[6.5rem_1fr] gap-x-2">
      <dt className="opacity-60">{term}</dt>
      <dd className="[overflow-wrap:anywhere] tabular-nums" title={title}>
        {children}
      </dd>
    </PagerLine>
  );
}

function ForecastLines({ stored }: Readonly<{ stored: StoredForecast }>) {
  const forecast = stored?.forecast;

  if (!forecast) {
    return (
      <PagerLine line={4} className="mt-2 text-base">
        Wird berechnet
        <PagerCursor />
      </PagerLine>
    );
  }

  const { keyword, address } = stored;

  return (
    <>
      <PagerLine line={4} className="mt-2 text-lg tabular-nums md:text-xl">
        <p title="Wahrscheinlichste Stunde rund um den Median der Prognose">
          {forecastDayFormatter.format(forecast.likely)} gegen{" "}
          {hourNumber(forecast.likely)} Uhr
        </p>
      </PagerLine>

      <dl className="mt-3 space-y-1 text-sm">
        <ForecastRow
          line={5}
          term="Zeitraum"
          title="Mit 50 % Wahrscheinlichkeit kommt der nächste Einsatz in diesem Zeitraum"
        >
          {formatSpan(forecast.quartiles.q25, forecast.quartiles.q75)}
        </ForecastRow>
        <ForecastRow line={6} term="24 Stunden">
          {formatChance(forecast.within24h)}
        </ForecastRow>
        <ForecastRow line={7} term="7 Tage">
          {formatChance(forecast.within7d)}
        </ForecastRow>
        <ForecastRow
          line={8}
          term="Stichwort"
          title="Anteil an den Einsätzen, jüngere zählen mehr"
        >
          {keyword
            ? `${keyword.value} · ${percentFormatter.format(keyword.share)}`
            : "unbekannt"}
        </ForecastRow>
        <ForecastRow
          line={9}
          term="Ort"
          title="Anteil an den Einsätzen mit Adresse, jüngere zählen mehr"
        >
          {address
            ? `${address.value} · ${percentFormatter.format(address.share)}`
            : "unbekannt"}
          <PagerCursor />
        </ForecastRow>
      </dl>

      {!forecast.ready ? (
        <PagerLine line={10} className="mt-3 text-xs opacity-60">
          Wenige Einsätze erfasst, Prognose grob
        </PagerLine>
      ) : null}
    </>
  );
}

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
  forecast: StoredForecast;
}>) {
  if (!lastAlarm) return <EmptyPager />;

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

      <ForecastLines stored={forecast} />
    </PagerDisplay>
  );
}
