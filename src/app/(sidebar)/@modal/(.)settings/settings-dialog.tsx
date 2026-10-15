"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import SettingsPanel from "~/app/_components/settings/settings";
import { useRouter } from "next/navigation";
import type { Doc } from "#/_generated/dataModel";

function SettingsDialog({ user }: Readonly<{ user: Doc<"users"> }>) {
  const router = useRouter();
  return (
    <Dialog
      defaultOpen={true}
      modal={true}
      open={true}
      onOpenChange={(to) => !to && router.back()}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl leading-none font-bold tracking-wide uppercase">
            Einstellungen
          </DialogTitle>
          <DialogDescription>
            Funkrufname, Anzeige und Anbindung an Alamos
          </DialogDescription>
        </DialogHeader>
        <SettingsPanel user={user} />
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
