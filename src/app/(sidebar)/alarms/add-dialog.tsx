"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useState } from "react";
import AlarmEditor, {
  type AlarmEditorSchema,
} from "~/app/(sidebar)/alarms/alarm-editor";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";
import type { Id } from "#/_generated/dataModel";

function DialogForm({
  onClose,
}: Readonly<{
  onClose: () => void;
}>) {
  const createAlarm = useMutation(api.alarms.add);

  async function onSubmit(values: AlarmEditorSchema | undefined) {
    onClose();
    if (values) {
      await createAlarm({
        ...values,
        date: values.date?.toISOString(),
        seat: values.seat ?? undefined,
        address: values.address ?? undefined,
        vehicle: (values.vehicle as Id<"vehicles">) ?? undefined,
        gone: values.gone ?? false,
      });
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
