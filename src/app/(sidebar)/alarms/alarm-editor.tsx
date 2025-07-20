"use client";

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
import { DateTimePicker24h } from "~/components/ui/date-time-picker";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";

const seatsInFahrzeugType = {
  GRUPPE: () => (
    <>
      <SelectItem value="0">Gruppenführer</SelectItem>
      <SelectItem value="1">Maschinist</SelectItem>
      <SelectItem value="2">Angriffstruppführer</SelectItem>
      <SelectItem value="3">Angriffstruppmann</SelectItem>
      <SelectItem value="4">Wassertruppführer</SelectItem>
      <SelectItem value="5">Wassertruppmann</SelectItem>
      <SelectItem value="6">Schlauchtruppführer</SelectItem>
      <SelectItem value="7">Schlauchtruppmann</SelectItem>
      <SelectItem value="8">Melder</SelectItem>
    </>
  ),
  STAFFEL: () => (
    <>
      <SelectItem value="0">Staffelführer</SelectItem>
      <SelectItem value="1">Maschinist</SelectItem>
      <SelectItem value="2">Angriffstruppführer</SelectItem>
      <SelectItem value="3">Angriffstruppmann</SelectItem>
      <SelectItem value="4">Wassertruppführer</SelectItem>
      <SelectItem value="5">Wassertruppmann</SelectItem>
    </>
  ),
  TRUPP: () => (
    <>
      <SelectItem value="0">Fahrzeugführer</SelectItem>
      <SelectItem value="1">Maschinist</SelectItem>
      <SelectItem value="2">Truppmann</SelectItem>
    </>
  ),
  MTW: () => (
    <>
      <SelectItem value="0">Fahrer</SelectItem>
      <SelectItem value="1">Mitfahrer</SelectItem>
    </>
  ),
};

const formSchema = z.object({
  keyword: z
    .string()
    .min(2, "Stichwort zu kurz!")
    .max(16, "Stichwort zu lang!"),
  address: z.string().max(255, "Adresse zu lang!").nullable(),
  date: z.date().nullable(),
  gone: z.boolean().nullable(),
  vehicle: z.string().nullable(),
  seat: z.number().max(16, "So viele Sitze gibt es nicht").nullable(),
});

export type AlarmEditorSchema = z.infer<typeof formSchema>;

export default function AlarmEditor({
  onSubmit,
  initialValue,
  submitText = "Anlegen",
}: Readonly<{
  onSubmit: (date: AlarmEditorSchema | undefined) => void;
  initialValue?: AlarmEditorSchema | undefined;
  submitText?: string;
}>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: initialValue?.keyword,
      address: initialValue?.address,
      date: initialValue?.date,
      gone: initialValue?.gone ?? true,
      vehicle: initialValue?.vehicle,
      seat: initialValue?.seat,
    },
  });

  const fahrzeuge = useQuery(api.vehicles.all) ?? [];
  const [fahrzeugeOpen, setFahrzeugeOpen] = useState(false);
  const [sitzplatzOpen, setSitzplatzOpen] = useState(false);

  const fahrzeugType = useMemo(() => {
    const vehicleId = form.getValues().vehicle;
    if (!vehicleId) {
      return null;
    }

    const vehicle = fahrzeuge.find((v) => v._id === vehicleId);

    if (!vehicle) {
      return null;
    }

    return vehicle.crew;
  }, [form.getValues().vehicle, fahrzeuge]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stichwort</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="F1" />
                </FormControl>
                <FormDescription>Das Einsatz Stichwort, F1, H2</FormDescription>
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
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Musterstraße 1"
                  />
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
                <div className="flex gap-2">
                  <FormLabel>Gegangen</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
            name={"gone"}
            control={form.control}
          />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fahrzeug</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                      open={fahrzeugeOpen}
                      onOpenChange={setFahrzeugeOpen}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Fahrzeug auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Fahrzeuge</SelectLabel>
                          {fahrzeuge.map((v) => (
                            <SelectItem value={v._id} key={v._id}>
                              {v.name}
                            </SelectItem>
                          ))}
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                field.onChange(null);
                                setFahrzeugeOpen(false);
                              }}
                            >
                              Zurücksetzen
                            </Button>
                          </div>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name={"vehicle"}
              control={form.control}
            />
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(v) => field.onChange(Number.parseInt(v))}
                      open={sitzplatzOpen}
                      onOpenChange={setSitzplatzOpen}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sitzplatz auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Position</SelectLabel>
                          {fahrzeugType
                            ? seatsInFahrzeugType[fahrzeugType]()
                            : null}
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                field.onChange(null);
                                setSitzplatzOpen(false);
                              }}
                            >
                              Zurücksetzen
                            </Button>
                          </div>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name={"seat"}
              control={form.control}
            />
          </div>
        </form>
      </Form>

      <div className="ml-auto space-x-4">
        <Button onClick={() => onSubmit(undefined)} variant="ghost">
          Abbrechen
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)}>{submitText}</Button>
      </div>
    </>
  );
}
