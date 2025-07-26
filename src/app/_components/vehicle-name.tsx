"use client";

import { api } from "#/_generated/api";
import type { Id } from "#/_generated/dataModel";
import { useQuery } from "convex/react";
import { TableCell, TableRow } from "~/components/ui/table";
import { seatInVehicleType } from "~/lib/seats";

export default function VehicleName({
  vehicleId,
  position,
  count,
}: Readonly<{
  vehicleId: Id<"vehicles">;
  position: number;
  count: number;
}>) {
  const vehicle = useQuery(api.vehicles.get, { id: vehicleId });

  return (
    <TableRow>
      <TableCell>
        {vehicle?.name ?? "..."} ({vehicle?.callSign ?? "..."})
      </TableCell>
      <TableCell>
        {vehicle ? seatInVehicleType[vehicle?.crew][position] : "..."}
      </TableCell>
      <TableCell>{count}</TableCell>
    </TableRow>
  );
}
