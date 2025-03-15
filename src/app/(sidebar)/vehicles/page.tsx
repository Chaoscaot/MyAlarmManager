import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";

export default async function Page() {
  const vehicles = await api.vehicles.all();

  return (
    <div className="grid px-4">
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id}>
          <CardHeader>
            <CardTitle>{vehicle.name}</CardTitle>
            <CardDescription>{vehicle.callSign}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
