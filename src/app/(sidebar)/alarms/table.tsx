"use client";

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Table as TanStackTable,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { columns, type AlarmRow } from "./columns";
import { DataTablePagination } from "~/app/_components/paginator";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "#/_generated/api";
import { useMemo, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DatePicker } from "~/components/ui/date-time-picker";

type DateFilter = {
  year?: string;
  from?: string;
  to?: string;
};

function FilterToolbar({
  table,
  alarms,
}: Readonly<{
  table: TanStackTable<AlarmRow>;
  alarms: AlarmRow[];
}>) {
  const dateFilter = (table.getColumn("date")?.getFilterValue() ??
    {}) as DateFilter;
  const goneFilter =
    (table.getColumn("gone")?.getFilterValue() as string | undefined) ?? "all";

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          alarms.map((alarm) =>
            new Date(alarm.alarms.date).getFullYear().toString(),
          ),
        ),
      ).sort((a, b) => Number(b) - Number(a)),
    [alarms],
  );

  const vehicles = useMemo(
    () =>
      Array.from(
        new Set(
          alarms
            .map((alarm) => alarm.vehicles?.name)
            .filter((name): name is string => Boolean(name)),
        ),
      ).sort((a, b) => a.localeCompare(b, "de")),
    [alarms],
  );

  function setDateFilter(next: DateFilter) {
    const compact = Object.fromEntries(
      Object.entries(next).filter(([, value]) => Boolean(value)),
    );
    table
      .getColumn("date")
      ?.setFilterValue(Object.keys(compact).length ? compact : undefined);
  }

  function resetFilters() {
    table.resetColumnFilters();
  }

  function parseFilterDate(value: string | undefined) {
    return value ? new Date(`${value}T00:00:00`) : null;
  }

  function formatFilterDate(date: Date | null) {
    if (!date) {
      return undefined;
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return (
    <div className="rounded-md border p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="space-y-1.5">
          <Label htmlFor="alarm-keyword-filter">Stichwort</Label>
          <Input
            id="alarm-keyword-filter"
            value={
              (table.getColumn("keyword")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("keyword")
                ?.setFilterValue(event.target.value || undefined)
            }
            placeholder="F1, H2..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="alarm-address-filter">Adresse</Label>
          <Input
            id="alarm-address-filter"
            value={
              (table.getColumn("address")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("address")
                ?.setFilterValue(event.target.value || undefined)
            }
            placeholder="Ort oder Straße"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Jahr</Label>
          <Select
            value={dateFilter.year ?? "all"}
            onValueChange={(value) =>
              setDateFilter({
                ...dateFilter,
                year: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Alle Jahre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Jahre</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Fahrzeug</Label>
          <Select
            value={
              (table.getColumn("vehicleName")?.getFilterValue() as string) ??
              "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("vehicleName")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Alle Fahrzeuge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Fahrzeuge</SelectItem>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle} value={vehicle}>
                  {vehicle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Gegangen</Label>
          <Select
            value={goneFilter}
            onValueChange={(value) =>
              table
                .getColumn("gone")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="true">Gegangen</SelectItem>
              <SelectItem value="false">Nicht gegangen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={resetFilters}
          >
            Filter zurücksetzen
          </Button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Von</Label>
          <DatePicker
            date={parseFilterDate(dateFilter.from)}
            placeholder="Von Datum"
            onChange={(date) =>
              setDateFilter({
                ...dateFilter,
                from: formatFilterDate(date),
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>Bis</Label>
          <DatePicker
            date={parseFilterDate(dateFilter.to)}
            placeholder="Bis Datum"
            onChange={(date) =>
              setDateFilter({
                ...dateFilter,
                to: formatFilterDate(date),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export function DataTable(props: {
  preloadedAlarms: Preloaded<typeof api.alarms.all>;
}) {
  const alarms = usePreloadedQuery(props.preloadedAlarms);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: alarms ?? [],
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className={"space-y-2"}>
      <FilterToolbar table={table} alarms={alarms ?? []} />
      <Table className="rounded-md border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
