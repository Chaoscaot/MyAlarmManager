"use client";

import { api } from "~/trpc/react";
import {
  Card, CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import React from "react";
import AddVehicleDialog from "~/app/(sidebar)/vehicles/add-vehicle";
import {Button} from "~/components/ui/button";

export default function VehiclesComponent() {
  const vehicles = api.vehicles.all.useQuery().data ?? [];

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex flex-row justify-end gap-4">
        <AddVehicleDialog />
      </div>
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id}>
          <CardHeader>
            <CardTitle>{vehicle.name}</CardTitle>
            <CardDescription>{vehicle.callSign}</CardDescription>
          </CardHeader>
          <CardContent className="justify-end flex flex-row">
            <Button variant="destructive">Delete</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
