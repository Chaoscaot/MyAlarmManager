"use client";

import { type SelectAlarm, type SelectVehicle } from "~/server/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import RowActions from "./row-actions";

const seatInVehicleType = {
  GRUPPE: [
    "Gruppenführer",
    "Maschinist",
    "Angriffstruppführer",
    "Angriffstruppmann",
    "Wassertruppführer",
    "Wassertruppmann",
    "Schlauchtruppführer",
    "Schlauchtruppmann",
    "Melder",
  ],
  STAFFEL: [
    "Staffelführer",
    "Maschinist",
    "Angriffstruppführer",
    "Angriffstruppmann",
    "Wassertruppführer",
    "Wassertruppmann",
  ],
  TRUPP: ["Fahrzeugführer", "Maschinist", "Truppmann"],
  MTW: ["Fahrer", "Mitfahrer"],
};

export const columns: ColumnDef<{
  alarms: SelectAlarm;
  vehicles: SelectVehicle | null;
}>[] = [
  {
    accessorKey: "alarms.keyword",
    header: "Stichwort",
  },
  {
    accessorKey: "alarms.date",
    id: "date",
    header: "Datum",
    cell: ({ row }) => {
      return new Intl.DateTimeFormat("de", {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(row.getValue("date"));
    },
  },
  {
    accessorKey: "alarms.address",
    header: "Adresse",
  },
  {
    accessorKey: "alarms.gone",
    id: "gone",
    header: "Gegangen",
    cell: ({ row }) => {
      return (
        <div className="flex">
          <Checkbox checked={row.getValue("gone")} />
        </div>
      );
    },
  },
  {
    accessorKey: "vehicles.name",
    id: "vehicleName",
    header: "Fahrzeug",
  },
  {
    accessorKey: "alarms.seat",
    id: "seat",
    header: "Position",
    cell: ({ row }) => {
      const type = row.original.vehicles?.crew;

      if (!type) {
        return null;
      }

      if (row.original.alarms.seat === null) {
        return null;
      }

      return seatInVehicleType[type][row.original.alarms.seat];
    },
  },
  {
    accessorKey: "id",
    header: "Aktion",
    cell: ({ row }) => {
      return <RowActions alarm={row.original.alarms} />;
    },
  },
];
