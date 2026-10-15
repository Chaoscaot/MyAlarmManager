"use client";

import { api } from "#/_generated/api";
import type { Doc, Id } from "#/_generated/dataModel";
import { useQuery } from "convex/react";
import { seatInVehicleType } from "~/lib/seats";

/**
 * Looks a vehicle up in the user's vehicle list.
 * Uses `vehicles.all` (one shared subscription) instead of `vehicles.get`,
 * which throws for deleted vehicles and would take the whole page down.
 * Returns `undefined` while loading and `null` if the vehicle no longer exists.
 */
export function useVehicle(
  vehicleId: Id<"vehicles"> | undefined,
): Doc<"vehicles"> | null | undefined {
  const vehicles = useQuery(api.vehicles.all);
  if (!vehicleId) return null;
  if (vehicles === undefined) return undefined;
  return vehicles.find((vehicle) => vehicle._id === vehicleId) ?? null;
}

export function seatName(vehicle: Doc<"vehicles">, seat: number) {
  return seatInVehicleType[vehicle.crew][seat] ?? `Platz ${seat + 1}`;
}

/** Seat name with the vehicle's call sign behind it, e.g. "Maschinist · HLF 20". */
export default function VehicleName({
  vehicleId,
  position,
}: Readonly<{
  vehicleId: Id<"vehicles">;
  position: number;
}>) {
  const vehicle = useVehicle(vehicleId);

  if (vehicle === undefined) {
    return <span className="text-muted-foreground">Lädt …</span>;
  }

  if (vehicle === null) {
    return <span className="text-muted-foreground">Gelöschtes Fahrzeug</span>;
  }

  return (
    <span className="flex min-w-0 items-baseline gap-2">
      <span className="truncate">{seatName(vehicle, position)}</span>
      <span className="text-muted-foreground font-display shrink-0 tracking-wide">
        {vehicle.callSign || vehicle.name}
      </span>
    </span>
  );
}
