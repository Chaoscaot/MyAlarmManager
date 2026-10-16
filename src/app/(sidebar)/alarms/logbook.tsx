import type React from "react";
import type { Doc } from "#/_generated/dataModel";
import { seatInVehicleType } from "~/lib/seats";
import { cn } from "~/lib/utils";

/**
 * Einsatzbuch building blocks shared by the alarms table, the detail dialog
 * and the unfinished list.
 */

export const fieldLabelClass =
  "text-muted-foreground text-xs font-medium tracking-wide uppercase";

const weekdayFormat = new Intl.DateTimeFormat("de", { weekday: "short" });
const dateFormat = new Intl.DateTimeFormat("de", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat("de", {
  hour: "2-digit",
  minute: "2-digit",
});
const longDateFormat = new Intl.DateTimeFormat("de", { dateStyle: "full" });

/** "Di 14.10.2025" */
export function formatDay(value: string | Date) {
  const date = new Date(value);
  return `${weekdayFormat.format(date).replace(".", "")} ${dateFormat.format(date)}`;
}

/** "14:32" */
export function formatTime(value: string | Date) {
  return timeFormat.format(new Date(value));
}

/** "Dienstag, 14. Oktober 2025 · 14:32 Uhr" */
export function formatLong(value: string | Date) {
  return `${longDateFormat.format(new Date(value))} · ${formatTime(value)} Uhr`;
}

export function seatName(
  alarm: Doc<"alarms">,
  vehicle: Doc<"vehicles"> | null,
) {
  if (!vehicle || typeof alarm.seat !== "number") {
    return null;
  }
  return seatInVehicleType[vehicle.crew][alarm.seat] ?? null;
}

/** The Einsatzstichwort as a compact tag with a feuerrot mark on the left. */
export function Stichwort({
  keyword,
  className,
}: Readonly<{ keyword: string; className?: string }>) {
  return (
    <span
      className={cn(
        "border-feuerrot font-display inline-block border-l-2 pl-2 text-lg leading-tight font-semibold tracking-wide uppercase",
        className,
      )}
    >
      {keyword}
    </span>
  );
}

export function AlarmTime({
  date,
  className,
}: Readonly<{ date: string; className?: string }>) {
  return (
    <time
      dateTime={date}
      className={cn("flex flex-col tabular-nums", className)}
    >
      <span>{formatDay(date)}</span>
      <span className="text-muted-foreground text-xs">{formatTime(date)}</span>
    </time>
  );
}

export function GoneMark({
  gone,
  className,
}: Readonly<{ gone: boolean; className?: string }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm",
        gone ? "text-foreground" : "text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-full",
          gone ? "bg-foreground" : "border-muted-foreground border",
        )}
      />
      {gone ? "gegangen" : "nicht gegangen"}
    </span>
  );
}

export function UnfinishedMark({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1.5 text-xs",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="bg-feuerrot size-1.5 rounded-full" />
      unvollständig
    </span>
  );
}

export function Placeholder({ children }: Readonly<{ children: string }>) {
  return <span className="text-muted-foreground">{children}</span>;
}
