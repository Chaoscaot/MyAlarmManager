import React from "react";
import {api, HydrateClient} from "~/trpc/server";
import VehiclesComponent from "~/app/(sidebar)/vehicles/vehicles";
import {auth} from "~/server/auth";

export default async function Page() {
  await api.vehicles.all.prefetch();
  const session = await auth()

  return (
      <HydrateClient>
        <VehiclesComponent session={session!} />
      </HydrateClient>
  );
}
