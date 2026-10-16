import { type RowData, type Table } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { type alarmTableFeatures } from "~/app/(sidebar)/alarms/columns";

interface DataTablePaginationProps<TData extends RowData> {
  table: Table<typeof alarmTableFeatures, TData>;
}

export function DataTablePagination<TData extends RowData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.store.state.pagination;
  const total = table.getFilteredRowModel().rows.length;
  const first = total === 0 ? 0 : pageIndex * pageSize + 1;
  const last = Math.min(total, (pageIndex + 1) * pageSize);
  const pageCount = Math.max(table.getPageCount(), 1);

  return (
    <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-1 text-sm tabular-nums">
      <p>
        <span className="text-foreground">
          {first}–{last}
        </span>{" "}
        von {total}
      </p>
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden items-center gap-2 sm:flex">
          <span id="paginator-page-size">Pro Seite</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              size="sm"
              className="w-[72px] tabular-nums"
              aria-labelledby="paginator-page-size"
            >
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span>
          Seite <span className="text-foreground">{pageIndex + 1}</span> /{" "}
          {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-8 lg:inline-flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Erste Seite</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Vorherige Seite</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Nächste Seite</span>
            <ChevronRight />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-8 lg:inline-flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Letzte Seite</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
