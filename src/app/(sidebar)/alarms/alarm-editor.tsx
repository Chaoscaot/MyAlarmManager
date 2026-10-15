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
import { Textarea } from "~/components/ui/textarea";
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
import { fieldLabelClass } from "./logbook";

const sectionClass =
  "font-display text-base leading-none font-semibold tracking-wide uppercase";

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
  notes: z.string().max(2000, "Notizen zu lang!").nullable(),
});

export type AlarmEditorSchema = z.infer<typeof formSchema>;

export default function AlarmEditor({
  onSubmit,
  initialValue,
  submitText = "Einsatz speichern",
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
      vehicle: initialValue?.vehicle ?? null,
      seat: initialValue?.seat ?? null,
      notes: initialValue?.notes ?? null,
    },
  });

  const fahrzeugeQuery = useQuery(api.vehicles.all);
  const fahrzeuge = useMemo(() => fahrzeugeQuery ?? [], [fahrzeugeQuery]);
  const [fahrzeugeOpen, setFahrzeugeOpen] = useState(false);
  const [sitzplatzOpen, setSitzplatzOpen] = useState(false);

  const vehicleId = form.getValues().vehicle;

  const fahrzeugType = useMemo(() => {
    if (!vehicleId) {
      return null;
    }

    const vehicle = fahrzeuge.find((v) => v._id === vehicleId);

    if (!vehicle) {
      return null;
    }

    return vehicle.crew;
  }, [vehicleId, fahrzeuge]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className={`${sectionClass} mb-4`}>Einsatz</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
              <FormField
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fieldLabelClass}>Stichwort</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="F2"
                        autoComplete="off"
                        className="font-display text-lg font-semibold tracking-wide uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                name={"keyword"}
                control={form.control}
              />
              <FormField
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fieldLabelClass}>
                      Alarmierung
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker24h
                        date={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                name={"date"}
                control={form.control}
              />
            </div>
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>Einsatzort</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Musterstraße 1, Gießen"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name={"address"}
              control={form.control}
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className={`${sectionClass} mb-4`}>Besetzung</legend>
            <FormField
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="grid gap-1">
                    <FormLabel>Gegangen</FormLabel>
                    <FormDescription className="text-xs">
                      Sie sind zu diesem Einsatz ausgerückt.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
              name={"gone"}
              control={form.control}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fieldLabelClass}>Fahrzeug</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                        open={fahrzeugeOpen}
                        onOpenChange={setFahrzeugeOpen}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Fahrzeug wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Fahrzeuge</SelectLabel>
                            {fahrzeuge.map((v) => (
                              <SelectItem value={v._id} key={v._id}>
                                {v.name}
                              </SelectItem>
                            ))}
                            <div className="flex justify-end border-t p-1 pt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  field.onChange(null);
                                  setFahrzeugeOpen(false);
                                }}
                              >
                                Auswahl entfernen
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
                    <FormLabel className={fieldLabelClass}>Position</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(v) =>
                          field.onChange(Number.parseInt(v))
                        }
                        open={sitzplatzOpen}
                        onOpenChange={setSitzplatzOpen}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              fahrzeugType
                                ? "Position wählen"
                                : "Zuerst Fahrzeug wählen"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Position</SelectLabel>
                            {fahrzeugType
                              ? seatsInFahrzeugType[fahrzeugType]()
                              : null}
                            <div className="flex justify-end border-t p-1 pt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  field.onChange(null);
                                  setSitzplatzOpen(false);
                                }}
                              >
                                Auswahl entfernen
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
          </fieldset>

          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel className={sectionClass}>Notizen</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Lage, Maßnahmen, Besonderheiten"
                    className="min-h-24"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Optional, nur für Sie sichtbar.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
            name={"notes"}
            control={form.control}
          />
        </form>
      </Form>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onClick={() => onSubmit(undefined)}
          variant="ghost"
        >
          Abbrechen
        </Button>
        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
          {submitText}
        </Button>
      </div>
    </>
  );
}
