"use client"

import { type SelectAlarm } from "~/server/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import {Checkbox} from "~/components/ui/checkbox";
import RowActions from "./row-actions";

export const columns: ColumnDef<SelectAlarm>[] = [
    {
        accessorKey: "keyword",
        header: "Stichwort",
    },
    {
        accessorKey: "date",
        header: "Datum",
        cell: ({row}) => {
            return new Intl.DateTimeFormat("de", {
                dateStyle: "medium",
                timeStyle: "medium",
            }).format(row.getValue("date"))
        }
    },
    {
        accessorKey: "address",
        header: "Adresse",
    },
    {
        accessorKey: "gone",
        header: "Gegangen",
        cell: ({row}) => {
            return (
                <div className="flex">
                    <Checkbox checked={row.getValue("gone")} />
                </div>
            )
        }
    },
    {
        accessorKey: "vehicle",
        header: "Fahrzeug",
    },
    {
        accessorKey: "seat",
        header: "Position",
    },
    {
        accessorKey: "id",
        header: "Aktion",
        cell: ({row}) => {
            return (
                <RowActions id={row.getValue("id")} />
            )
        }
    }
]