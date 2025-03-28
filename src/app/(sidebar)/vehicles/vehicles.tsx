"use client";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import React from "react";
import AddVehicleDialog from "~/app/(sidebar)/vehicles/add-vehicle";
import { Button } from "~/components/ui/button";
import type { Session } from "next-auth";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "~/components/ui/alert-dialog";

export default function VehiclesComponent({
  session,
}: Readonly<{ session: Session }>) {
  const vehicles = api.vehicles.all.useQuery().data ?? [];
  const utils = api.useUtils();
  const deleteVehicle = api.vehicles.del.useMutation({
    async onMutate(added) {
      await utils.vehicles.all.cancel();

      const prevData = utils.vehicles.all.getData();

      utils.vehicles.all.setData(undefined, (old) => old?.filter((v) => v.id !== added));

      return { prevData };
    },
    onError(err, newPost, ctx) {
      utils.vehicles.all.setData(undefined, ctx!.prevData);
    },
    async onSettled() {
      await utils.vehicles.all.invalidate();
    },
  });

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex flex-row justify-end gap-4">
        <AddVehicleDialog />
      </div>
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id}>
          <CardHeader>
            <CardTitle>{vehicle.name}</CardTitle>
            <CardDescription>{session.user.wehrName ? `Florian ${session.user.wehrName} ` : null}{vehicle.callSign}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Löschen</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fahrzeug löschen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Möchten Sie dieses Fahrzeug wirklich löschen? Diese Aktion kann
                    nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteVehicle.mutate(vehicle.id)}>
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
