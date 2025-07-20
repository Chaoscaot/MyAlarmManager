"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import SettingsPanel from "~/app/_components/settings/settings";
import { useRouter } from "next/navigation";
import { Doc } from "#/_generated/dataModel";

function SettingsDialog({ user }: Readonly<{ user: Doc<"users"> }>) {
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
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <SettingsPanel user={user} />
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
