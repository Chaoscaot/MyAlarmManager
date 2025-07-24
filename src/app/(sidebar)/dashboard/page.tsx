import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  TimeOfDayChart,
  ZeitChart,
} from "~/app/(sidebar)/dashboard/zeit_chart";
import { fetchQuery } from "convex/nextjs";
import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import VehicleName from "~/app/_components/vehicle-name";

async function Page() {
  const stats = await fetchQuery(
    api.stats.get,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  const hoursOfDay = stats.timesOfAlarms.map((alarm) =>
    Number(
      new Intl.DateTimeFormat("de", { hour: "2-digit" })
        .format(new Date(alarm))
        .substring(0, 2),
    ),
  );

  return (
    <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Zeit Zwischen Einsätzen</CardTitle>
        </CardHeader>
        <CardContent>
          <ZeitChart
            stats={stats.times.map((v, i) => ({ value: v, index: i }))}
          />
          <p>Kürzeste: {new Intl.NumberFormat().format(stats.minTime)} Tage</p>
          <p>Längste: {new Intl.NumberFormat().format(stats.maxTime)} Tage</p>
          <p>
            Durchschnitt: {new Intl.NumberFormat().format(stats.avgTime)} Tage
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Einsatz Tageszeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeOfDayChart
            stats={Array.from({ length: 24 }, (_, v) => ({
              timeOfDay: v,
              value: hoursOfDay.filter((h) => h === v).length ?? 0,
            }))}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Häufigste Orte</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableHead>Ort</TableHead>
              <TableHead>Anzahl</TableHead>
            </TableHeader>
            <TableBody>
              {stats.locations.map((location) => (
                <TableRow>
                  <TableCell>{location.address}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat().format(location.count)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Häufigste Positionen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableHead>Fahrzeug</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Anzahl</TableHead>
            </TableHeader>
            <TableBody>
              {stats.positions.map((pos) => (
                <VehicleName
                  count={pos.count}
                  position={pos.seat}
                  vehicleId={pos.vehicle}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
