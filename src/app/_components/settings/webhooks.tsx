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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Copy, Menu, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";

function CreateWebhookComponent() {
  const inputRef = useRef<HTMLInputElement>(null);

  const createWebhook = useMutation(api.webhooks.create);

  async function create() {
    createWebhook({
      name: inputRef.current!.value,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Webhook Erstellen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Webhook Erstellen</DialogTitle>
          <DialogDescription>Gebe der Webhook einen Namen</DialogDescription>
        </DialogHeader>
        <Input id="webhook-name" placeholder="Name" ref={inputRef} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Abbrechen</Button>
          </DialogClose>
          <DialogClose asChild onClick={create}>
            <Button>Erstellen</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WebhookManager() {
  const hooks = useQuery(api.webhooks.list) ?? [];

  const deleteHook = useMutation(api.webhooks.remove);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Erstellt</TableHead>
            <TableHead>Aktion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hooks.map((hook) => (
            <TableRow key={hook._id}>
              <TableCell>{hook.name}</TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("de", {
                  timeStyle: "short",
                  dateStyle: "medium",
                }).format(new Date(hook._creationTime))}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Menu />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
                            ".cloud",
                            ".site",
                          ) +
                            "/webhook/" +
                            hook.token,
                        );
                        toast("Link Kopiert!");
                      }}
                    >
                      <Copy />
                      Link Kopieren
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => deleteHook({ id: hook._id })}
                    >
                      <Trash />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CreateWebhookComponent />
    </div>
  );
}
