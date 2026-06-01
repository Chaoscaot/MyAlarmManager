"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
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
import { Edit, Eye, Menu, Trash } from "lucide-react";
import AlarmDetail from "~/app/(sidebar)/alarms/alarm-detail";

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
            <Button size="icon" variant="ghost">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setDetailOpen(true)}>
              <Eye /> Details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Edit /> Bearbeiten
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem>
                <Trash /> Löschen
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alarm löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Alarm wirklich löschen? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAlarm({ id: alarm._id })}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alarmdetails</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zu diesem Einsatz.
            </DialogDescription>
          </DialogHeader>
          <AlarmDetail alarm={alarm} vehicle={vehicle} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alarmierung Bearbeiten</DialogTitle>
            <DialogDescription>Alarmierung Bearbeiten</DialogDescription>
          </DialogHeader>
          <EditAlarmDialog onClose={() => setEditOpen(false)} alarm={alarm} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RowActions;
