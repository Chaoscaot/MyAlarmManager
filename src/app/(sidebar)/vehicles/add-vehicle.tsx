"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "~/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Mindestens 2 Lang!")
    .max(16, "Der Name darf nicht länger als 16 sein"),
  callSign: z
    .string()
    .min(2, "Der Funkrufname muss mindestens 2 lang sein")
    .max(16, "Der Funkrufname darf nicht länger als 16 sein"),
  crew: z.enum(["GRUPPE", "STAFFEL", "TRUPP", "MTW"]),
});

function AddVehicleForm({
  onClose,
}: Readonly<{
  onClose: () => void;
}>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: undefined,
      callSign: undefined,
      crew: "GRUPPE",
    },
  });

  const createVehicleMutation = useMutation(api.vehicles.add);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onClose();
    await createVehicleMutation(values);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="LF10" />
                </FormControl>
                <FormDescription>
                  Der Name des Fahrzeuges, LF10, HLF20, TSFW
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
            name={"name"}
          />
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funkrufname</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="5-19-1" />
                </FormControl>
                <FormDescription>
                  Der Funkrufname des Fahrzeuges
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
            name={"callSign"}
          />
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>Besatzung</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger className={"w-full"}>
                      <SelectValue placeholder="Besatzung Auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Besatzungen</SelectLabel>
                        <SelectItem value="GRUPPE">Gruppe</SelectItem>
                        <SelectItem value="STAFFEL">Staffel</SelectItem>
                        <SelectItem value="TRUPP">
                          Eigenständiger Trupp
                        </SelectItem>
                        <SelectItem value="MTW">
                          Mannschaftstransportwagen
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Der Funkrufname des Fahrzeuges
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
            name={"crew"}
          />
        </form>
      </Form>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Abbrechen</Button>
        </DialogClose>
        <Button onClick={form.handleSubmit(onSubmit)}>Erstellen</Button>
      </DialogFooter>
    </>
  );
}

export default function AddVehicleDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Fahrzeug Hinzufügen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fahrzeug Hinzufügen</DialogTitle>
          <DialogDescription>Erstelle ein neues Fahrzeug</DialogDescription>
        </DialogHeader>
        <AddVehicleForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
