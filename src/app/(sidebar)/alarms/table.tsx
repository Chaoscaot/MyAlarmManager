"use client"

import {flexRender, getCoreRowModel, getPaginationRowModel, useReactTable} from "@tanstack/react-table";
import {
  Table,
  TableBody, TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { columns } from "./columns";
import {api} from "~/trpc/react";
import {DataTablePagination} from "~/app/_components/paginator";

export function DataTable() {
  const alarms = api.alarms.all.useQuery();

  const table = useReactTable({
    data: alarms.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
      <div className={"space-y-2"}>
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
                                  header.getContext()
                              )}
                        </TableHead>
                    )
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
  )
}
