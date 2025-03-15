"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { DialogBody } from "next/dist/client/components/react-dev-overlay/ui/components/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

const formSchema = z.object({
  keyword: z.string().max(16, "Stichwort zu lang!"),
  address: z.string().max(255, "Adresse zu lang!"),
  date: z.date(),
  gone: z.boolean(),
});

function DialogForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: "",
      address: "",
      date: new Date(),
      gone: false,
    },
  });

  const utils = api.useUtils();
  const createAlarm = api.alarms.add.useMutation({
    async onMutate(added) {
      await utils.alarms.all.cancel();

      const prevData = utils.alarms.all.getData();

      utils.alarms.all.setData(undefined, (old) => [
        ...old!,
        {
          keyword: added.keyword,
          address: added.address!,
          date: new Date(added.date),
          gone: added.gone,
          id: "-1",
          userId: "CREATED",
          createdAt: new Date(),
          updatedAt: new Date(),
          units: "",
          vehicle: null,
          seat: null,
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    createAlarm.mutate(values)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Einsatz anlegen</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stichwort</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="F1" />
                  </FormControl>
                  <FormDescription>
                    Das Einsatz Stichwort, F1, H2
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
              name={"keyword"}
              control={form.control}
            />
            <FormField
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Musterstraße 1" />
                      </FormControl>
                      <FormDescription>
                        Adresse des Einsatzes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                )}
                name={"address"}
                control={form.control}
            />
          </form>
        </Form>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Abbrechen</Button>
        </DialogClose>
        <Button onClick={form.handleSubmit(onSubmit)}>Anlegen</Button>
      </DialogFooter>
    </>
  );
}

export default function CreateAlarmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Einsatz Hinzufügen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogForm />
      </DialogContent>
    </Dialog>
  );
}
