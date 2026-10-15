"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import type { Doc } from "#/_generated/dataModel";
import {
  UnfinishedAlarms,
  unfinishedSummary,
  useUnfinishedAlarms,
} from "~/app/_components/unfinished/unfinished";

function UnfinishedDialog({
  alarms,
}: Readonly<{
  alarms: Array<{ alarms: Doc<"alarms">; vehicles: Doc<"vehicles"> | null }>;
}>) {
  const router = useRouter();
  const count = useUnfinishedAlarms(alarms).length;

  return (
    <Dialog
      defaultOpen={true}
      modal={true}
      open={true}
      onOpenChange={(to) => !to && router.back()}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Unvollständige Alarmierungen</DialogTitle>
          <DialogDescription>{unfinishedSummary(count)}</DialogDescription>
        </DialogHeader>
        <UnfinishedAlarms alarms={alarms} className="border-t" />
      </DialogContent>
    </Dialog>
  );
}

export default UnfinishedDialog;
