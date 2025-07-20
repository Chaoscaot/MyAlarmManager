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
import { Checkbox } from "~/components/ui/checkbox";
import { Doc } from "#/_generated/dataModel";
import { api } from "#/_generated/api";
import { useMutation } from "convex/react";
import { CheckedState } from "@radix-ui/react-checkbox";

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
      showEmail: user.showEmail,
    },
  });

  const updateSettings = useMutation(api.user.saveSettings);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    await updateSettings(values);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funkrufname</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Musterstadt..." />
                </FormControl>
                <FormDescription>
                  Der Funkrufname des Ortes, Florian Musterstadt
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
            name={"wehrName"}
          />
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail Anzeigen</FormLabel>
                <FormControl>
                  {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                  <Checkbox
                    checked={field.value as CheckedState}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name={"showEmail"}
          />
        </form>
      </Form>
      <Button className="mt-4" onClick={form.handleSubmit(onSubmit)}>
        Speichern
      </Button>
    </>
  );
}
