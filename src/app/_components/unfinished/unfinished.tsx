"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import type { Doc } from "#/_generated/dataModel";
import RowActions, {
  EditAlarmContent,
} from "~/app/(sidebar)/alarms/row-actions";
import {
  formatDay,
  formatTime,
  Placeholder,
  Stichwort,
} from "~/app/(sidebar)/alarms/logbook";
import PageHeader from "~/app/_components/page-header";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

type AlarmRow = { alarms: Doc<"alarms">; vehicles: Doc<"vehicles"> | null };

/** Server-fetched rows as a first paint, then the live query so completed entries drop out. */
export function useUnfinishedAlarms(initial: AlarmRow[]) {
  const live = useQuery(api.alarms.all);
  return useMemo(
    () => (live ?? initial).filter((alarm) => alarm.alarms.uneditedFromWebhook),
    [live, initial],
  );
}

export function unfinishedSummary(count: number) {
  if (count === 0) {
    return "Keine offenen Alarmierungen.";
  }
  return count === 1
    ? "1 Alarmierung vom Melder wartet auf Ergänzung."
    : `${count} Alarmierungen vom Melder warten auf Ergänzung.`;
}

function UnfinishedEntry({ row }: Readonly<{ row: AlarmRow }>) {
  const [editOpen, setEditOpen] = useState(false);
  const { alarms: alarm, vehicles: vehicle } = row;

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Stichwort keyword={alarm.keyword} />
          <time
            dateTime={alarm.date}
            className="text-muted-foreground text-sm tabular-nums"
          >
            {formatDay(alarm.date)} · {formatTime(alarm.date)}
          </time>
        </div>
        <p className="truncate text-sm">
          {alarm.address || <Placeholder>Keine Adresse</Placeholder>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          Ergänzen
          <span className="sr-only">: {alarm.keyword}</span>
        </Button>
        <RowActions alarm={alarm} vehicle={vehicle} />
      </div>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <EditAlarmContent alarm={alarm} onClose={() => setEditOpen(false)} />
      </Dialog>
    </li>
  );
}

export function UnfinishedAlarms({
  alarms,
  className,
}: Readonly<{
  alarms: AlarmRow[];
  className?: string;
}>) {
  const unfinishedAlarms = useUnfinishedAlarms(alarms);

  if (unfinishedAlarms.length === 0) {
    return (
      <div className={cn("space-y-2 py-10 text-center", className)}>
        <p className="font-medium">Alle Alarmierungen sind vollständig.</p>
        <p className="text-muted-foreground mx-auto max-w-prose text-sm">
          Neue Alarmierungen vom Alamos-Melder erscheinen hier, bis Sie
          Fahrzeug, Position und Teilnahme ergänzt haben.
        </p>
      </div>
    );
  }

  return (
    <ul className={cn("divide-border/70 divide-y", className)}>
      {unfinishedAlarms.map((alarm) => (
        <UnfinishedEntry key={alarm.alarms._id} row={alarm} />
      ))}
    </ul>
  );
}

export function UnfinishedPage({ alarms }: Readonly<{ alarms: AlarmRow[] }>) {
  const count = useUnfinishedAlarms(alarms).length;

  return (
    <>
      <PageHeader title="Unvollständig" meta={unfinishedSummary(count)} />
      <div className="px-4 md:px-6">
        <UnfinishedAlarms
          alarms={alarms}
          className="bg-card max-w-3xl rounded-md border px-4"
        />
      </div>
    </>
  );
}
