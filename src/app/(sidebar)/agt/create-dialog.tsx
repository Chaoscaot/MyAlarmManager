import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { CheckType } from "./page";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";

const nameMap: Record<CheckType[number], string> = {
  G26: " G26",
  STRECKE: "n Streckendurchgang",
  UNTERWEISUNG: " Unterweisung",
  UEBUNG: " Übung",
};

export default function CreateDialog({
  children,
  type,
}: {
  children: React.ReactNode;
  type?: CheckType;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Neue{type ? nameMap[type] : " Vorraussetzung"} anlegen
          </DialogTitle>
        </DialogHeader>
        <CreateDialogForm type={type} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

const formSchema = z.object({
  type: z.enum(["G26", "STRECKE", "UNTERWEISUNG", "UEBUNG"]),
  year: z.number().min(2000).max(2100),
  month: z.number().min(1).max(12),
  validity: z.number().min(1).max(3),
});

function CreateDialogForm({
  type,
  onClose,
}: {
  type?: CheckType;
  onClose: () => void;
}) {
  const createAgt = useMutation(api.agt.add);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      type: type ?? "G26",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      validity: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onClose();
    await createAgt(values);
    form.reset();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Typ</FormLabel>
                  <Select
                    onValueChange={(e) => {
                      field.onChange(e);
                      if (e != "G26") {
                        form.setValue("validity", 1);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Typ Auswählen..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(nameMap).map((value) => (
                        <SelectItem key={value} value={value}>
                          {nameMap[value]?.substring(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validity"
              rules={{ deps: ["validity"] }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Gültigkeit</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(e) => field.onChange(Number(e))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="w-full"
                          disabled={form.watch(["type"])[0] != "G26"}
                        >
                          <SelectValue placeholder="Gültigkeit auswählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 3 }, (_, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {i + 1} Jahr(e)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Monat</FormLabel>
                  <Select
                    onValueChange={(e) => field.onChange(Number(e))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Monat auswählen..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {new Date(0, i).toLocaleString("default", {
                            month: "long",
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Jahr</FormLabel>
                  <Select
                    onValueChange={(e) => field.onChange(Number(e))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Jahr auswählen..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem
                          key={i}
                          value={(i + new Date().getFullYear() - 5).toString()}
                        >
                          {i + new Date().getFullYear() - 5}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit">Erstellen</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
