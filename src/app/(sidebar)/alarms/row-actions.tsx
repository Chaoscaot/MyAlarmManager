import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Edit, Menu, Trash } from "lucide-react";
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
  DialogTrigger,
} from "~/components/ui/dialog";
import EditAlarmDialog from "~/app/(sidebar)/alarms/edit-alarm";
import { Doc } from "#/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";

function RowActions({ alarm }: Readonly<{ alarm: Doc<"alarms"> }>) {
  const deleteAlarm = useMutation(api.alarms.remove);

  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <AlertDialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Edit /> Bearbeiten
              </DropdownMenuItem>
            </DialogTrigger>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem>
                <Trash /> Löschen
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alarmierung Bearbeiten</DialogTitle>
            <DialogDescription>Alarmierung Bearbeiten</DialogDescription>
          </DialogHeader>
          <EditAlarmDialog onClose={() => setEditOpen(false)} alarm={alarm} />
        </DialogContent>
      </Dialog>
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
  );
}

export default RowActions;
