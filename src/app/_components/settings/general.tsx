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

const formSchema = z.object({
  wehrName: z.string().nullable(),
  showEmail: z.boolean(),
});

export default function GeneralSettingsPane({
  session,
}: Readonly<{ session: Session }>) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wehrName: session.user.wehrName,
    },
  });

  return (
    <>
      <Form {...form}>
        <form>
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
        </form>
      </Form>
      <Button>Speichern</Button>
    </>
  );
}
