"use client";

import {
  type ColumnFiltersState,
  flexRender,
  type SortingState,
  type Table as TanStackTable,
  useTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  alarmTableFeatures,
  columns,
  WebhookHint,
  type AlarmRow,
} from "./columns";
import {
  fieldLabelClass,
  formatDay,
  formatTime,
  GoneMark,
  Placeholder,
  seatName,
  Stichwort,
} from "./logbook";
import RowActions from "./row-actions";
import { ChevronDown, X } from "lucide-react";
import { cn } from "~/lib/utils";
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
  table: TanStackTable<typeof alarmTableFeatures, AlarmRow>;
  alarms: AlarmRow[];
}>) {
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const activeFilters = table.store.state.columnFilters.length;

  return (
    <div className="bg-card rounded-md border">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:hidden">
        <span className={fieldLabelClass}>
          Filter
          {activeFilters > 0 && (
            <span className="text-foreground tabular-nums">
              {" "}
              · {activeFilters} aktiv
            </span>
          )}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={filtersOpen}
          aria-controls="alarm-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          {filtersOpen ? "Ausblenden" : "Einblenden"}
          <ChevronDown
            aria-hidden
            className={cn(
              "transition-transform motion-reduce:transition-none",
              filtersOpen && "rotate-180",
            )}
          />
        </Button>
      </div>
      <div
        id="alarm-filters"
        className={cn(
          "gap-x-3 gap-y-4 border-t p-4 sm:grid-cols-2 md:grid md:border-t-0 lg:grid-cols-4",
          filtersOpen ? "grid" : "hidden",
        )}
      >
        <div className="space-y-1.5">
          <Label htmlFor="alarm-keyword-filter" className={fieldLabelClass}>
            Stichwort
          </Label>
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
            placeholder="F2, H1 VU …"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="alarm-address-filter" className={fieldLabelClass}>
            Einsatzort
          </Label>
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
          <Label className={fieldLabelClass}>Jahr</Label>
          <Select
            value={dateFilter.year ?? "all"}
            onValueChange={(value) =>
              setDateFilter({
                ...dateFilter,
                year: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full tabular-nums" aria-label="Jahr">
              <SelectValue placeholder="Alle Jahre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Jahre</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year} className="tabular-nums">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={fieldLabelClass}>Fahrzeug</Label>
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
            <SelectTrigger className="w-full" aria-label="Fahrzeug">
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
          <Label className={fieldLabelClass}>Teilnahme</Label>
          <Select
            value={goneFilter}
            onValueChange={(value) =>
              table
                .getColumn("gone")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-full" aria-label="Teilnahme">
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="true">Gegangen</SelectItem>
              <SelectItem value="false">Nicht gegangen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={fieldLabelClass}>Von</Label>
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
          <Label className={fieldLabelClass}>Bis</Label>
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
        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground w-full"
            onClick={resetFilters}
            disabled={activeFilters === 0}
          >
            <X aria-hidden />
            Filter zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  filtered,
  onReset,
}: Readonly<{ filtered: boolean; onReset: () => void }>) {
  if (filtered) {
    return (
      <div className="space-y-3 px-4 py-12 text-center">
        <p className="font-medium">Keine Einsätze für diese Filter.</p>
        <p className="text-muted-foreground text-sm">
          Passen Sie die Filter an oder setzen Sie sie zurück.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Filter zurücksetzen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-4 py-12 text-center">
      <p className="font-medium">Noch keine Einsätze erfasst.</p>
      <p className="text-muted-foreground mx-auto max-w-prose text-sm">
        Legen Sie einen Einsatz über „Einsatz hinzufügen“ an. Alarmierungen vom
        Alamos-Melder erscheinen hier automatisch.
      </p>
    </div>
  );
}

/** Below lg the table becomes a stack of logbook entries. */
function LogbookEntry({ row }: Readonly<{ row: AlarmRow }>) {
  const { alarms: alarm, vehicles: vehicle } = row;
  const seat = seatName(alarm, vehicle);

  return (
    <li className="flex gap-2 px-4 py-4">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <Stichwort keyword={alarm.keyword} className="min-w-0 truncate" />
          <time
            dateTime={alarm.date}
            className="text-muted-foreground shrink-0 text-sm tabular-nums"
          >
            {formatDay(alarm.date)} · {formatTime(alarm.date)}
          </time>
        </div>
        <p className="truncate text-sm">
          {alarm.address || <Placeholder>Keine Adresse</Placeholder>}
        </p>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {vehicle ? (
            <span>
              <span className="font-display text-foreground text-sm font-semibold tracking-wide uppercase">
                {vehicle.name}
              </span>
              {seat && <> · {seat}</>}
            </span>
          ) : (
            <span>Kein Fahrzeug</span>
          )}
          <GoneMark gone={alarm.gone} className="text-xs" />
          {alarm.uneditedFromWebhook && <WebhookHint />}
        </div>
      </div>
      <div className="-mr-2 shrink-0 self-center">
        <RowActions alarm={alarm} vehicle={vehicle} />
      </div>
    </li>
  );
}

const sortOptions = [
  { value: "default", label: "Standard", sorting: [] },
  {
    value: "date-desc",
    label: "Neueste zuerst",
    sorting: [{ id: "date", desc: true }],
  },
  {
    value: "date-asc",
    label: "Älteste zuerst",
    sorting: [{ id: "date", desc: false }],
  },
  {
    value: "keyword",
    label: "Stichwort A–Z",
    sorting: [{ id: "keyword", desc: false }],
  },
  {
    value: "address",
    label: "Einsatzort A–Z",
    sorting: [{ id: "address", desc: false }],
  },
  {
    value: "vehicle",
    label: "Fahrzeug A–Z",
    sorting: [{ id: "vehicleName", desc: false }],
  },
] satisfies { value: string; label: string; sorting: SortingState }[];

/** The stacked list has no column headers, so sorting gets its own control. */
function ListSort({
  sorting,
  onChange,
}: {
  sorting: SortingState;
  onChange: (sorting: SortingState) => void;
}) {
  const current =
    sortOptions.find(
      (option) =>
        option.sorting.length === sorting.length &&
        option.sorting.every(
          (sort, index) =>
            sort.id === sorting[index]?.id &&
            sort.desc === sorting[index]?.desc,
        ),
    )?.value ?? "default";

  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <Label htmlFor="alarm-list-sort" className={fieldLabelClass}>
        Sortierung
      </Label>
      <Select
        value={current}
        onValueChange={(value) =>
          onChange(
            sortOptions.find((option) => option.value === value)?.sorting ?? [],
          )
        }
      >
        <SelectTrigger id="alarm-list-sort" size="sm" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DataTable(props: {
  preloadedAlarms: Preloaded<typeof api.alarms.all>;
}) {
  const alarms = usePreloadedQuery(props.preloadedAlarms);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useTable({
    features: alarmTableFeatures,
    data: alarms ?? [],
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  const rows = table.getRowModel().rows;
  const isEmpty = rows.length === 0;
  const emptyState = (
    <EmptyState
      filtered={(alarms ?? []).length > 0}
      onReset={() => table.resetColumnFilters()}
    />
  );

  return (
    <div className="space-y-4">
      <FilterToolbar table={table} alarms={alarms ?? []} />

      <div className="bg-card rounded-md border">
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        aria-sort={
                          sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : undefined
                        }
                        className={cn(
                          "h-11 px-4 text-[11px] font-medium tracking-[0.14em] uppercase",
                          header.column.columnDef.meta?.className,
                        )}
                      >
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
              {isEmpty ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0">
                    {emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border/70 hover:bg-accent/40"
                  >
                    {row.getAllCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "h-16 px-4 py-3",
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="lg:hidden">
          <ListSort sorting={sorting} onChange={setSorting} />
          {isEmpty ? (
            emptyState
          ) : (
            <ul className="divide-border/70 divide-y">
              {rows.map((row) => (
                <LogbookEntry key={row.id} row={row.original} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
