"use client";

import type { Doc } from "#/_generated/dataModel";
import type React from "react";
import { Pencil } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  fieldLabelClass,
  formatDay,
  formatTime,
  GoneMark,
  Placeholder,
  seatName,
  UnfinishedMark,
} from "./logbook";

const sectionClass =
  "font-display text-base leading-none font-semibold tracking-wide uppercase";

function DetailItem({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="space-y-1.5">
      <dt className={fieldLabelClass}>{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default function AlarmDetail({
  alarm,
  vehicle,
  onEdit,
}: Readonly<{
  alarm: Doc<"alarms">;
  vehicle: Doc<"vehicles"> | null;
  onEdit?: () => void;
}>) {
  const seat = seatName(alarm, vehicle);
  const history = alarm.editHistory?.slice().reverse() ?? [];
  const notes = alarm.notes?.trim();

  return (
    <div className="space-y-6">
      {alarm.uneditedFromWebhook && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3">
          <div className="space-y-1">
            <UnfinishedMark className="text-foreground text-sm" />
            <p className="text-muted-foreground text-sm">
              Vom Melder angelegt. Ergänzen Sie Fahrzeug, Position und
              Teilnahme.
            </p>
          </div>
          {onEdit && (
            <Button type="button" size="sm" onClick={onEdit}>
              Jetzt ergänzen
            </Button>
          )}
        </div>
      )}

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-y py-4 sm:grid-cols-2">
        <DetailItem label="Einsatzort">
          {alarm.address || <Placeholder>Keine Adresse</Placeholder>}
        </DetailItem>
        <DetailItem label="Teilnahme">
          <GoneMark gone={alarm.gone} />
        </DetailItem>
        <DetailItem label="Fahrzeug">
          {vehicle ? (
            <span className="font-display text-base font-semibold tracking-wide uppercase">
              {vehicle.name}
            </span>
          ) : (
            <Placeholder>Kein Fahrzeug</Placeholder>
          )}
        </DetailItem>
        <DetailItem label="Position">
          {seat ?? <Placeholder>Keine Position</Placeholder>}
        </DetailItem>
      </dl>

      <section className="space-y-3">
        <h3 className={sectionClass}>Notizen</h3>
        {notes && notes.length > 0 ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{notes}</p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Keine Notizen hinterlegt.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className={sectionClass}>Bearbeitungshistorie</h3>
        {history.length > 0 ? (
          <ol className="ml-1 space-y-4 border-l">
            {history.map((entry) => (
              <li
                key={`${entry.at}-${entry.changes.join("-")}`}
                className="relative pl-4"
              >
                <span
                  aria-hidden
                  className="bg-muted-foreground absolute top-1.5 -left-[3.5px] size-1.5 rounded-full"
                />
                <time
                  dateTime={entry.at}
                  className="text-muted-foreground block text-xs tabular-nums"
                >
                  {formatDay(entry.at)} · {formatTime(entry.at)}
                </time>
                <p className="text-sm">{entry.changes.join(", ")}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground text-sm">
            Seit dem Anlegen nicht bearbeitet.
          </p>
        )}
      </section>

      {onEdit && !alarm.uneditedFromWebhook && (
        <div className="flex justify-end border-t pt-4">
          <Button type="button" variant="outline" onClick={onEdit}>
            <Pencil aria-hidden />
            Einsatz bearbeiten
          </Button>
        </div>
      )}
    </div>
  );
}
