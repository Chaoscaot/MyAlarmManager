"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import EditAlarmDialog from "~/app/(sidebar)/alarms/edit-alarm";
import type { Doc } from "#/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import AlarmDetail from "~/app/(sidebar)/alarms/alarm-detail";
import { formatDay, formatLong, formatTime, Stichwort } from "./logbook";

export function EditAlarmContent({
  alarm,
  onClose,
}: Readonly<{ alarm: Doc<"alarms">; onClose: () => void }>) {
  return (
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Einsatz bearbeiten</DialogTitle>
        <DialogDescription className="tabular-nums">
          {alarm.keyword} · {formatDay(alarm.date)}, {formatTime(alarm.date)}{" "}
          Uhr
        </DialogDescription>
      </DialogHeader>
      <EditAlarmDialog onClose={onClose} alarm={alarm} />
    </DialogContent>
  );
}

function RowActions({
  alarm,
  vehicle,
}: Readonly<{ alarm: Doc<"alarms">; vehicle: Doc<"vehicles"> | null }>) {
  const deleteAlarm = useMutation(api.alarms.remove);

  const [editOpen, setEditOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);

  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground size-8"
            >
              <MoreHorizontal aria-hidden />
              <span className="sr-only">Aktionen für {alarm.keyword}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem onSelect={() => setDetailOpen(true)}>
              <Eye /> Details ansehen
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Pencil /> Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">
                <Trash2 /> Löschen
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Einsatz löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Einsatz{" "}
              <span className="text-foreground">{alarm.keyword}</span> vom{" "}
              <span className="tabular-nums">
                {formatDay(alarm.date)}, {formatTime(alarm.date)} Uhr
              </span>{" "}
              wird dauerhaft aus Ihrem Einsatzbuch entfernt. Das lässt sich
              nicht rückgängig machen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => deleteAlarm({ id: alarm._id })}
            >
              Einsatz löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className="gap-3">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
              Einsatz
            </p>
            <DialogTitle asChild>
              <h2>
                <Stichwort
                  keyword={alarm.keyword}
                  className="border-l-[3px] pl-3 text-3xl leading-none font-bold"
                />
              </h2>
            </DialogTitle>
            <DialogDescription className="tabular-nums">
              {formatLong(alarm.date)}
            </DialogDescription>
          </DialogHeader>
          <AlarmDetail
            alarm={alarm}
            vehicle={vehicle}
            onEdit={() => {
              setDetailOpen(false);
              setEditOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <EditAlarmContent alarm={alarm} onClose={() => setEditOpen(false)} />
      </Dialog>
    </>
  );
}

export default RowActions;
