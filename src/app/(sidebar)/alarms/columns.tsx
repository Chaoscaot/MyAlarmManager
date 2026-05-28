"use client";

import { type Column, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import RowActions from "./row-actions";
import type { Doc } from "#/_generated/dataModel";
import { seatInVehicleType } from "~/lib/seats";
import { Button } from "~/components/ui/button";
import { ArrowUpDown, Icon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { MessageSquareWarningIcon } from "lucide-react";

export type AlarmRow = {
  alarms: Doc<"alarms">;
  vehicles: Doc<"vehicles"> | null;
};

type DateFilter = {
  year?: string;
  from?: string;
  to?: string;
};

function SortHeader({
  title,
  column,
}: Readonly<{
  title: string;
  column: Column<AlarmRow, unknown>;
}>) {
  return (
    <Button
      variant="ghost"
      className="h-8 px-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 size-4" />
    </Button>
  );
}

export const columns: ColumnDef<AlarmRow>[] = [
  {
    accessorKey: "alarms.keyword",
    id: "keyword",
    header: ({ column }) => <SortHeader title="Stichwort" column={column} />,
    filterFn: (row, id, value: string) =>
      row.getValue<string>(id).toLowerCase().includes(value.toLowerCase()),
    cell: ({ row }) => {
      const keyword = row.getValue<string>("keyword");
      const fromWebhook = row.original.alarms.uneditedFromWebhook;
      return (
        <div className="flex items-center gap-2">
          <div>{keyword}</div>
          {fromWebhook && (
            <Tooltip>
              <TooltipTrigger>
                <MessageSquareWarningIcon className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                Dieses Alarm wurde automatisch von einem Webhook erstellt und
                wurde seitdem nicht bearbeitet.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "alarms.date",
    id: "date",
    header: ({ column }) => <SortHeader title="Datum" column={column} />,
    cell: ({ row }) => {
      return new Intl.DateTimeFormat("de", {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(new Date(row.getValue("date")));
    },
    filterFn: (row, id, value: DateFilter) => {
      const date = new Date(row.getValue<string>(id));
      if (value.year && date.getFullYear().toString() !== value.year) {
        return false;
      }
      if (value.from) {
        const from = new Date(`${value.from}T00:00:00`);
        if (date < from) return false;
      }
      if (value.to) {
        const to = new Date(`${value.to}T23:59:59.999`);
        if (date > to) return false;
      }
      return true;
    },
  },
  {
    accessorKey: "alarms.address",
    id: "address",
    header: ({ column }) => <SortHeader title="Adresse" column={column} />,
    filterFn: (row, id, value: string) =>
      row.getValue<string>(id).toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: "alarms.gone",
    id: "gone",
    header: ({ column }) => <SortHeader title="Gegangen" column={column} />,
    cell: ({ row }) => {
      return (
        <div className="flex">
          <Checkbox checked={row.getValue("gone")} />
        </div>
      );
    },
    filterFn: (row, id, value: string) => {
      if (value === "all") return true;
      return row.getValue<boolean>(id) === (value === "true");
    },
  },
  {
    accessorKey: "vehicles.name",
    id: "vehicleName",
    header: ({ column }) => <SortHeader title="Fahrzeug" column={column} />,
    filterFn: (row, id, value: string) =>
      (row.getValue<string | undefined>(id) ?? "")
        .toLowerCase()
        .includes(value.toLowerCase()),
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
      return (
        <RowActions
          alarm={row.original.alarms}
          vehicle={row.original.vehicles}
        />
      );
    },
  },
];
