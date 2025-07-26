import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import React from "react";
import VehiclesComponent from "~/app/(sidebar)/vehicles/vehicles";

export default async function Page() {
  const preloadedVehicles = await preloadQuery(
    api.vehicles.all,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  const preloadedUser = await preloadQuery(
    api.user.currentuser,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  return (
    <VehiclesComponent
      preloadedVehicles={preloadedVehicles}
      preloadedCurrentUser={preloadedUser}
    />
  );
}
