import React from "react";
import {api, HydrateClient} from "~/trpc/server";
import VehiclesComponent from "~/app/(sidebar)/vehicles/vehicles";

export default async function Page() {
  await api.vehicles.all.prefetch();

  return (
      <HydrateClient>
        <VehiclesComponent />
      </HydrateClient>
  );
}
