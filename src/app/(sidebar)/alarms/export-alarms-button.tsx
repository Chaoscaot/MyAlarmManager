"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { api } from "#/_generated/api";
import type { Doc } from "#/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { seatInVehicleType } from "~/lib/seats";

type AlarmRow = {
  alarms: Doc<"alarms">;
  vehicles: Doc<"vehicles"> | null;
};

const dateFormatter = new Intl.DateTimeFormat("de", {
  dateStyle: "medium",
  timeStyle: "medium",
});
const REVOKE_DELAY_MS = 1000;

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function formatSeat(alarm: AlarmRow) {
  if (typeof alarm.alarms.seat !== "number") {
    return "";
  }

  const crew = alarm.vehicles?.crew;

  if (!crew) {
    return "";
  }

  return seatInVehicleType[crew][alarm.alarms.seat] ?? "";
}

function createCsvContent(alarms: AlarmRow[]) {
  const rows = [
    ["Stichwort", "Datum", "Adresse", "Gegangen", "Fahrzeug", "Position"],
    ...alarms.map((alarm) => [
      alarm.alarms.keyword,
      dateFormatter.format(new Date(alarm.alarms.date)),
      alarm.alarms.address,
      alarm.alarms.gone ? "Ja" : "Nein",
      alarm.vehicles?.name ?? "",
      formatSeat(alarm),
    ]),
  ];

  return rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(";"))
    .join("\r\n");
}

function createFileName() {
  return `alarms-${new Date().toISOString().slice(0, 10)}.csv`;
}

export default function ExportAlarmsButton(props: {
  preloadedAlarms: Preloaded<typeof api.alarms.all>;
}) {
  const alarms = usePreloadedQuery(props.preloadedAlarms) ?? [];

  function exportToCsv() {
    if (!alarms.length) {
      toast.info("Keine Alarme zum Exportieren vorhanden.");
      return;
    }

    const csv = createCsvContent(alarms);
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = createFileName();
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);

    toast.success("Alarme als CSV exportiert.");
  }

  return (
    <Button onClick={exportToCsv} variant="outline">
      <Download />
      Alarme exportieren
    </Button>
  );
}
