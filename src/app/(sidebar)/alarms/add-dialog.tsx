"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { useState } from "react";
import AlarmEditor, {
  type AlarmEditorSchema,
} from "~/app/(sidebar)/alarms/alarm-editor";

function DialogForm({
  onClose,
}: Readonly<{
  onClose: () => void;
}>) {
  const utils = api.useUtils();
  const createAlarm = api.alarms.add.useMutation({
    async onMutate(added) {
      await utils.alarms.all.cancel();

      const prevData = utils.alarms.all.getData();

      utils.alarms.all.setData(undefined, (old) => [
        ...old!,
        {
          alarms: {
            keyword: added.keyword,
            address: added.address!,
            date: added.date ? new Date(added.date) : new Date(),
            gone: added.gone,
            id: "-1",
            userId: "CREATED",
            createdAt: new Date(),
            updatedAt: new Date(),
            units: "",
            vehicle: added.vehicle ?? null,
            seat: added.seat ?? null,
          },
          vehicles: null,
        },
      ]);

      return { prevData };
    },
    onError(err, newPost, ctx) {
      utils.alarms.all.setData(undefined, ctx!.prevData);
    },
    async onSettled() {
      await utils.alarms.all.invalidate();
    },
  });

  function onSubmit(values: AlarmEditorSchema | undefined) {
    onClose();
    if (values) {
      createAlarm.mutate(values);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Einsatz anlegen</DialogTitle>
      </DialogHeader>
      <Dialog>
        <AlarmEditor onSubmit={onSubmit} />
      </Dialog>
    </>
  );
}

export default function CreateAlarmDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Einsatz Hinzufügen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
