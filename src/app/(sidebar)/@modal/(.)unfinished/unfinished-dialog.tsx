"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import type { Doc } from "#/_generated/dataModel";
import { UnfinishedAlarms } from "~/app/_components/unfinished/unfinished";

function UnfinishedDialog({
  alarms,
}: Readonly<{
  alarms: Array<{ alarms: Doc<"alarms">; vehicles: Doc<"vehicles"> | null }>;
}>) {
  const router = useRouter();
  return (
    <Dialog
      defaultOpen={true}
      modal={true}
      open={true}
      onOpenChange={(to) => !to && router.back()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unvollständige Alarmierungen</DialogTitle>
        </DialogHeader>
        <UnfinishedAlarms alarms={alarms} />
      </DialogContent>
    </Dialog>
  );
}

export default UnfinishedDialog;
