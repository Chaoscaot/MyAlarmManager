"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import React from "react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import type { Doc } from "#/_generated/dataModel";
import { api } from "#/_generated/api";
import { useMutation } from "convex/react";

const formSchema = z.object({
  wehrName: z.string(),
  showEmail: z.boolean(),
});

export default function GeneralSettingsPane({
  user,
}: Readonly<{ user: Doc<"users"> }>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wehrName: user.wehrName ?? "",
      showEmail: user.showEmail ?? false,
    },
  });

  const updateSettings = useMutation(api.user.saveSettings);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await updateSettings(values);
  }

  const wehrName = form.watch("wehrName");
  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ortsname im Funkrufnamen</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Musterstadt" />
              </FormControl>
              <FormDescription>
                Steht vor der Kennung jedes Fahrzeugs:{" "}
                <span className="text-foreground font-display tracking-wide uppercase">
                  Florian {wehrName || "Musterstadt"} 1/46-1
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
          name={"wehrName"}
        />
        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start justify-between gap-6">
              <div className="grid gap-1.5">
                <FormLabel>E-Mail-Adresse anzeigen</FormLabel>
                <FormDescription>
                  Zeigt Ihre E-Mail-Adresse unten in der Seitenleiste.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  className="mt-0.5"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          name={"showEmail"}
        />
        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Wird gespeichert…" : "Speichern"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
