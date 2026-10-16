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
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "~/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";
import { seatInVehicleType } from "~/lib/seats";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Mindestens 2 Zeichen.")
    .max(16, "Höchstens 16 Zeichen."),
  callSign: z
    .string()
    .min(2, "Mindestens 2 Zeichen.")
    .max(16, "Höchstens 16 Zeichen."),
  crew: z.enum(["GRUPPE", "STAFFEL", "TRUPP", "MTW"]),
});

const crewOptions: {
  value: z.infer<typeof formSchema>["crew"];
  label: string;
}[] = [
  { value: "GRUPPE", label: "Gruppe" },
  { value: "STAFFEL", label: "Staffel" },
  { value: "TRUPP", label: "Selbstständiger Trupp" },
  { value: "MTW", label: "Mannschaftstransportwagen" },
];

function AddVehicleForm({
  wehrName,
  onClose,
}: Readonly<{
  wehrName?: string;
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

  const callSign = form.watch("callSign");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fahrzeug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="HLF 20" autoComplete="off" />
              </FormControl>
              <FormDescription>
                Kurzbezeichnung, z. B. LF 10, HLF 20 oder TSF-W.
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
                <Input {...field} placeholder="1/46-1" autoComplete="off" />
              </FormControl>
              <FormDescription>
                Nur die Kennung.{" "}
                {wehrName ? (
                  <>
                    Angezeigt als{" "}
                    <span className="text-foreground font-display tracking-wide uppercase">
                      Florian {wehrName} {callSign || "1/46-1"}
                    </span>
                    .
                  </>
                ) : (
                  "Den Ortsnamen legen Sie in den Einstellungen fest."
                )}
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
                    <SelectValue placeholder="Besatzung wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {crewOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        <span className="text-muted-foreground tabular-nums">
                          {seatInVehicleType[option.value].length} Plätze
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Bestimmt die Sitzpositionen, die Sie bei Einsätzen wählen
                können.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
          name={"crew"}
        />
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Abbrechen
            </Button>
          </DialogClose>
          <Button type="submit">Anlegen</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AddVehicleDialog({
  wehrName,
}: Readonly<{ wehrName?: string }>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Fahrzeug hinzufügen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fahrzeug hinzufügen</DialogTitle>
          <DialogDescription>
            Das Fahrzeug steht danach bei jedem Einsatz zur Auswahl.
          </DialogDescription>
        </DialogHeader>
        <AddVehicleForm wehrName={wehrName} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
