"use client";

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
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";

export default function VehiclesComponent() {
  const vehicles = useQuery(api.vehicles.all);
  const currentUser = useQuery(api.user.currentuser);
  const deleteVehicle = useMutation(api.vehicles.remove);

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex flex-row justify-end gap-4">
        <AddVehicleDialog />
      </div>
      {vehicles?.map((vehicle) => (
        <Card key={vehicle._id}>
          <CardHeader>
            <CardTitle>{vehicle.name}</CardTitle>
            <CardDescription>
              {currentUser?.wehrName
                ? `Florian ${currentUser?.wehrName} `
                : null}
              {vehicle.callSign}
            </CardDescription>
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
                    Möchten Sie dieses Fahrzeug wirklich löschen? Diese Aktion
                    kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteVehicle({ id: vehicle._id })}
                  >
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
