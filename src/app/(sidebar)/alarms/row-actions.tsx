import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Edit, Menu, Trash } from "lucide-react";
import { api } from "~/trpc/react";
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

function RowActions({ id }: Readonly<{ id: string }>) {
  const utils = api.useUtils();
  const deleteAlarm = api.alarms.del.useMutation({
    async onMutate(added) {
      await utils.alarms.all.cancel();

      const prevData = utils.alarms.all.getData();

      utils.alarms.all.setData(undefined, (old) =>
        old?.filter((v) => v.id !== added),
      );

      return { prevData };
    },
    onError(err, newPost, ctx) {
      utils.alarms.all.setData(undefined, ctx!.prevData);
    },
    async onSettled() {
      await utils.alarms.all.invalidate();
    },
  });

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled>
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
            Möchten Sie diesen Alarm wirklich löschen? Diese Aktion kann
            nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteAlarm.mutate(id)}>
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default RowActions;
