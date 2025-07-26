"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import RowActions from "./row-actions";
import type { Doc } from "#/_generated/dataModel";
import { seatInVehicleType } from "~/lib/seats";

export const columns: ColumnDef<{
  alarms: Doc<"alarms">;
  vehicles: Doc<"vehicles"> | null;
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
      }).format(new Date(row.getValue("date")));
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
