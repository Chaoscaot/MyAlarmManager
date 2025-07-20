import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  TimeOfDayChart,
  ZeitChart,
} from "~/app/(sidebar)/dashboard/zeit_chart";
import { fetchQuery } from "convex/nextjs";
import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

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
      {JSON.stringify(stats, null, 2)}
    </div>
  );
}

export default Page;
