"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";

function webhookUrl(token: string) {
  return (
    process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".cloud", ".site") +
    "/webhook/" +
    token
  );
}

function CreateWebhookComponent() {
  const inputRef = useRef<HTMLInputElement>(null);

  const createWebhook = useMutation(api.webhooks.create);

  async function create() {
    await createWebhook({
      name: inputRef.current!.value,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Webhook anlegen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Webhook anlegen</DialogTitle>
          <DialogDescription>
            Der Name hilft Ihnen, die Adresse später wiederzuerkennen, z. B. der
            Name des Alamos-Geräts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="webhook-name">Name</Label>
          <Input
            id="webhook-name"
            placeholder="Alamos Wache"
            autoComplete="off"
            ref={inputRef}
          />
        </div>
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DialogClose>
          <DialogClose asChild onClick={create}>
            <Button>Anlegen</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WebhookManager() {
  const hooks = useQuery(api.webhooks.list) ?? [];

  const deleteHook = useMutation(api.webhooks.remove);

  async function copy(token: string) {
    await navigator.clipboard.writeText(webhookUrl(token));
    toast("Adresse kopiert");
  }

  return (
    <div className="grid gap-4">
      {hooks.length > 0 ? (
        <ul className="divide-y rounded-md border">
          {hooks.map((hook) => (
            <li
              key={hook._id}
              className="grid grid-cols-[minmax(0,1fr)] gap-2 py-3 pr-2 pl-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{hook.name}</p>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    Angelegt am{" "}
                    {new Intl.DateTimeFormat("de", {
                      timeStyle: "short",
                      dateStyle: "medium",
                    }).format(new Date(hook._creationTime))}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Aktionen für ${hook.name}`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={async () => deleteHook({ id: hook._id })}
                    >
                      <Trash2 />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="bg-background flex items-center gap-1 rounded-sm border py-0.5 pr-0.5 pl-3">
                <code className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs tabular-nums">
                  {webhookUrl(hook.token)}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label={`Adresse von ${hook.name} kopieren`}
                  onClick={() => copy(hook.token)}
                >
                  <Copy />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground rounded-md border border-dashed px-4 py-5 text-sm">
          Noch kein Webhook angelegt.
        </p>
      )}
      <div>
        <CreateWebhookComponent />
      </div>
    </div>
  );
}
