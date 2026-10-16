"use client";

import {
  type Column,
  type ColumnDef,
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";
import RowActions from "./row-actions";
import type { Doc } from "#/_generated/dataModel";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  AlarmTime,
  GoneMark,
  Placeholder,
  Stichwort,
  UnfinishedMark,
  seatName,
} from "./logbook";

export const alarmTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnMeta: metaHelper<{
    /** Extra classes for both the header and the body cell of this column. */
    className?: string;
  }>(),
});

type AlarmTableFeatures = typeof alarmTableFeatures;

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
  column: Column<AlarmTableFeatures, AlarmRow, unknown>;
}>) {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <button
      type="button"
      className="hover:text-foreground focus-visible:ring-ring/50 -mx-1.5 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-sm px-1.5 uppercase outline-none focus-visible:ring-[3px]"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      <Icon
        aria-hidden
        className={sorted ? "size-3.5" : "size-3.5 opacity-50"}
      />
    </button>
  );
}

export function WebhookHint() {
  return (
    <Tooltip>
      <TooltipTrigger className="focus-visible:ring-ring/50 w-fit rounded-sm outline-none focus-visible:ring-[3px]">
        <UnfinishedMark />
      </TooltipTrigger>
      <TooltipContent>
        Vom Melder angelegt und noch nicht ergänzt.
      </TooltipContent>
    </Tooltip>
  );
}

export const columns: ColumnDef<AlarmTableFeatures, AlarmRow>[] = [
  {
    accessorKey: "alarms.keyword",
    id: "keyword",
    header: ({ column }) => <SortHeader title="Stichwort" column={column} />,
    filterFn: (row, id, value: string) =>
      row.getValue<string>(id).toLowerCase().includes(value.toLowerCase()),
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <Stichwort keyword={row.getValue<string>("keyword")} />
        {row.original.alarms.uneditedFromWebhook && <WebhookHint />}
      </div>
    ),
    meta: { className: "w-40" },
  },
  {
    accessorKey: "alarms.date",
    id: "date",
    header: ({ column }) => <SortHeader title="Alarmierung" column={column} />,
    cell: ({ row }) => <AlarmTime date={row.getValue<string>("date")} />,
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
    meta: { className: "w-36" },
  },
  {
    accessorKey: "alarms.address",
    id: "address",
    header: ({ column }) => <SortHeader title="Einsatzort" column={column} />,
    cell: ({ row }) => {
      const address = row.getValue<string>("address");
      return address ? (
        <span className="block max-w-[32ch] truncate" title={address}>
          {address}
        </span>
      ) : (
        <Placeholder>Keine Adresse</Placeholder>
      );
    },
    filterFn: (row, id, value: string) =>
      row.getValue<string>(id).toLowerCase().includes(value.toLowerCase()),
  },
  {
    accessorKey: "vehicles.name",
    id: "vehicleName",
    header: ({ column }) => <SortHeader title="Fahrzeug" column={column} />,
    cell: ({ row }) => {
      const vehicle = row.original.vehicles;
      if (!vehicle) {
        return <Placeholder>Kein Fahrzeug</Placeholder>;
      }
      const seat = seatName(row.original.alarms, vehicle);
      return (
        <div className="flex flex-col">
          <span className="font-display text-base leading-tight font-semibold tracking-wide uppercase">
            {vehicle.name}
          </span>
          {seat && (
            <span className="text-muted-foreground text-xs">{seat}</span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value: string) =>
      (row.getValue<string | undefined>(id) ?? "")
        .toLowerCase()
        .includes(value.toLowerCase()),
  },
  {
    accessorKey: "alarms.gone",
    id: "gone",
    header: ({ column }) => <SortHeader title="Teilnahme" column={column} />,
    cell: ({ row }) => <GoneMark gone={row.getValue<boolean>("gone")} />,
    filterFn: (row, id, value: string) => {
      if (value === "all") return true;
      return row.getValue<boolean>(id) === (value === "true");
    },
    meta: { className: "w-36" },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Aktionen</span>,
    cell: ({ row }) => (
      <RowActions alarm={row.original.alarms} vehicle={row.original.vehicles} />
    ),
    meta: { className: "w-12 text-right" },
  },
];
