"use client";

import type { Doc } from "#/_generated/dataModel";
import type React from "react";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { seatInVehicleType } from "~/lib/seats";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(new Date(value));
}

function DetailItem({
  label,
  value,
}: Readonly<{ label: string; value: React.ReactNode }>) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-sm">{value ?? "Nicht angegeben"}</dd>
    </div>
  );
}

export default function AlarmDetail({
  alarm,
  vehicle,
}: Readonly<{
  alarm: Doc<"alarms">;
  vehicle: Doc<"vehicles"> | null;
}>) {
  const seat =
    vehicle && alarm.seat !== null
      ? seatInVehicleType[vehicle.crew][alarm.seat]
      : null;
  const history = alarm.editHistory?.slice().reverse() ?? [];
  const notes = alarm.notes?.trim();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-muted-foreground text-sm">
            {formatDate(alarm.date)}
          </div>
          <div className="text-2xl font-semibold">{alarm.keyword}</div>
        </div>
        <Badge variant={alarm.gone ? "default" : "secondary"}>
          {alarm.gone ? "Gegangen" : "Nicht gegangen"}
        </Badge>
      </div>

      <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DetailItem label="Adresse" value={alarm.address} />
        <DetailItem label="Fahrzeug" value={vehicle?.name} />
        <DetailItem label="Position" value={seat} />
        <DetailItem label="Datum" value={formatDate(alarm.date)} />
      </dl>

      <Separator />

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Notizen</h3>
        <p className="bg-muted/40 min-h-20 rounded-md border p-3 text-sm whitespace-pre-wrap">
          {notes && notes.length > 0 ? notes : "Keine Notizen hinterlegt."}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Bearbeitungshistorie</h3>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={`${entry.at}-${entry.changes.join("-")}`}
                className="border-l-2 pl-3"
              >
                <div className="text-muted-foreground text-xs">
                  {formatDate(entry.at)}
                </div>
                <div className="text-sm">{entry.changes.join(", ")}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Noch keine Bearbeitungshistorie vorhanden.
          </p>
        )}
      </section>
    </div>
  );
}
