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
import { useState } from "react";
import { DateTimePicker24h } from "~/components/ui/date-time-picker";
import { Checkbox } from "~/components/ui/checkbox";

const formSchema = z.object({
  keyword: z
    .string()
    .min(2, "Stichwort zu kurz!")
    .max(16, "Stichwort zu lang!"),
  address: z.string().max(255, "Adresse zu lang!").optional(),
  date: z.date(),
  gone: z.boolean().nullable(),
});

function DialogForm({
  onClose,
}: Readonly<{
  onClose: () => void;
}>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: undefined,
      address: undefined,
      date: undefined,
      gone: null,
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
    onClose();
    createAlarm.mutate(values);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Einsatz anlegen</DialogTitle>
      </DialogHeader>
      <Dialog>
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
                  <FormDescription>Adresse des Einsatzes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
              name={"address"}
              control={form.control}
            />
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamierung</FormLabel>
                  <FormControl>
                    <DateTimePicker24h
                      date={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Zeitpunkt der Alamierung</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
              name={"date"}
              control={form.control}
            />
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gegangen</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name={"gone"}
              control={form.control}
            />
          </form>
        </Form>
      </Dialog>
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
