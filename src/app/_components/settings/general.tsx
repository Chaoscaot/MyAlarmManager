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
import type { Session } from "next-auth";
import { Input } from "~/components/ui/input";
import React from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {Checkbox} from "~/components/ui/checkbox";

const formSchema = z.object({
  wehrName: z.string().nullable(),
  showEmail: z.boolean(),
});

export default function GeneralSettingsPane({
  session,
}: Readonly<{ session: Session }>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wehrName: session.user.wehrName ?? "",
      showEmail: session.user.showEmail,
    },
  });

  const updateSettings = api.user.saveSettings.useMutation();

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    updateSettings.mutate(values);
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
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name={"showEmail"}
          />
        </form>
      </Form>
      <Button className="mt-4" onClick={form.handleSubmit(onSubmit)}>Speichern</Button>
    </>
  );
}
