"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import {
  AddVehicleDialog,
  EditVehicleDialog,
} from "~/app/(sidebar)/vehicles/vehicle-dialogs";
import PageHeader from "~/app/_components/page-header";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "#/_generated/api";
import type { Doc } from "#/_generated/dataModel";
import { seatInVehicleType } from "~/lib/seats";
import { cn } from "~/lib/utils";

const crewLabel: Record<Doc<"vehicles">["crew"], string> = {
  GRUPPE: "Gruppe",
  STAFFEL: "Staffel",
  TRUPP: "Trupp",
  MTW: "MTW",
};

/** Long place names would push the call sign out of the hero line, so they step back. */
const LONG_WEHR_NAME = 12;

function VehiclePlate({
  vehicle,
  wehrName,
  onDelete,
}: Readonly<{
  vehicle: Doc<"vehicles">;
  wehrName?: string;
  onDelete: () => void;
}>) {
  const seats = seatInVehicleType[vehicle.crew].length;

  return (
    <article className="bg-card relative flex flex-col overflow-hidden rounded-lg border">
      <span
        aria-hidden
        className="bg-feuerrot absolute top-0 left-5 h-0.5 w-8"
      />
      <div className="flex flex-1 flex-col gap-3 px-5 pt-6 pb-5">
        <h2 className="font-display leading-none font-bold tracking-wide uppercase">
          <span className="block text-xl font-semibold">
            Florian
            {wehrName ? (
              <>
                {" "}
                <span
                  className={cn(
                    wehrName.length > LONG_WEHR_NAME && "text-muted-foreground",
                  )}
                >
                  {wehrName}
                </span>
              </>
            ) : null}
          </span>
          <span className="mt-1 block text-4xl break-words tabular-nums sm:text-5xl">
            {vehicle.callSign}
          </span>
        </h2>
        <p className="text-base font-medium">{vehicle.name}</p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t py-2 pr-2 pl-5">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.18em] uppercase">
          {crewLabel[vehicle.crew]}
          <span aria-hidden className="mx-2">
            ·
          </span>
          {seats} Plätze
          {vehicle.staffelBenchSeats ? (
            <>
              <span aria-hidden className="mx-2">
                ·
              </span>
              Sitzbank
            </>
          ) : null}
        </p>
        <div className="flex shrink-0 items-center">
          <EditVehicleDialog vehicle={vehicle} wehrName={wehrName} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`${vehicle.name} löschen`}
              >
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Fahrzeug löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie {vehicle.name} ({vehicle.callSign}) wirklich
                  löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({ variant: "destructive" })}
                  onClick={onDelete}
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </article>
  );
}

export default function VehiclesComponent(props: {
  preloadedVehicles: Preloaded<typeof api.vehicles.all>;
  preloadedCurrentUser: Preloaded<typeof api.user.currentuser>;
}) {
  const vehicles = usePreloadedQuery(props.preloadedVehicles);
  const currentUser = usePreloadedQuery(props.preloadedCurrentUser);
  const deleteVehicle = useMutation(api.vehicles.remove);

  const count = vehicles?.length ?? 0;
  const wehrName = currentUser?.wehrName;

  return (
    <>
      <PageHeader
        title="Fahrzeuge"
        meta={
          count > 0
            ? `${count} ${count === 1 ? "Fahrzeug" : "Fahrzeuge"}`
            : "Noch keine Fahrzeuge angelegt"
        }
        actions={count > 0 ? <AddVehicleDialog wehrName={wehrName} /> : null}
      />
      <div className="px-4 md:px-6">
        {count > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vehicles?.map((vehicle) => (
              <VehiclePlate
                key={vehicle._id}
                vehicle={vehicle}
                wehrName={wehrName}
                onDelete={() => deleteVehicle({ id: vehicle._id })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed px-5 py-8 md:px-8">
            <p className="max-w-md text-base">
              Legen Sie Ihr erstes Fahrzeug an, um Einsätzen eine Position
              zuzuordnen.
            </p>
            <AddVehicleDialog wehrName={wehrName} />
          </div>
        )}
      </div>
    </>
  );
}
