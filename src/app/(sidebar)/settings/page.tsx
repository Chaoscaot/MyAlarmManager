"use client";

import React, { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api, getBaseUrl } from "~/trpc/react";
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
import { DialogBody } from "next/dist/client/components/react-dev-overlay/ui/components/dialog";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Copy, Menu, Trash } from "lucide-react";
import { toast } from "sonner";

function CreateWebhookComponent({ invalidate }: { invalidate: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();
  const createWebhook = api.hooks.create.useMutation({
    async onMutate(created) {
      await utils.hooks.list.cancel();

      const prevData = utils.hooks.list.getData();

      utils.hooks.list.setData(undefined, (old) => [
        ...old!,
        {
          id: -1,
          name: created,
          userId: "CREATED",
          token: "CREATED",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      return { prevData };
    },
    onError(err, newPost, ctx) {
      utils.hooks.list.setData(undefined, ctx!.prevData);
    },
    async onSettled() {
      await utils.hooks.list.invalidate();
    },
  });

  async function create() {
    createWebhook.mutate(inputRef.current!.value, {
      onSuccess: (result) => {
        console.log(result);
        invalidate();
      },
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
        <DialogBody>
          <Input id="webhook-name" placeholder="Name" ref={inputRef} />
        </DialogBody>
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

function WebhookManager() {
  const hooksResult = api.hooks.list.useQuery();
  const utils = api.useUtils();
  const hooks = hooksResult.data ?? [];

  const deleteHook = api.hooks.delete.useMutation({
    async onMutate(deleted) {
      await utils.hooks.list.cancel();

      const prevData = utils.hooks.list.getData();

      utils.hooks.list.setData(undefined, (old) =>
        old!.filter((v) => v.id !== deleted),
      );

      return { prevData };
    },
    onError(err, newPost, ctx) {
      utils.hooks.list.setData(undefined, ctx!.prevData);
    },
    async onSettled() {
      await utils.hooks.list.invalidate();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhooks</CardTitle>
        <CardDescription>Webhooks verwalten und erstellen</CardDescription>
      </CardHeader>
      <CardContent>
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
              <TableRow key={hook.id}>
                <TableCell>{hook.name}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("de", {
                    timeStyle: "short",
                    dateStyle: "medium",
                  }).format(hook.createdAt)}
                </TableCell>
                {hook.id === -1 ? (
                  <TableCell>
                    <Button size="icon" variant="ghost" disabled>
                      <Menu />
                    </Button>
                  </TableCell>
                ) : (
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
                              getBaseUrl() + "/api/webhook/" + hook.token,
                            );
                            toast("Link Kopiert!");
                          }}
                        >
                          <Copy />
                          Link Kopieren
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () =>
                            deleteHook.mutate(hook.id, {
                              // eslint-disable-next-line @typescript-eslint/no-misused-promises
                              onSuccess: () => hooksResult.refetch(),
                            })
                          }
                        >
                          <Trash />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <CreateWebhookComponent invalidate={utils.hooks.list.invalidate} />
      </CardFooter>
    </Card>
  );
}

function Page() {
  return (
    <div>
      <WebhookManager />
    </div>
  );
}

export default Page;
