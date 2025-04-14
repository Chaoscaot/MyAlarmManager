import React from 'react';
import {api} from "~/trpc/server";
import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {TimeOfDayChart, ZeitChart} from "~/app/(sidebar)/dashboard/zeit_chart";

async function Page() {
  const stats = await api.stats.load();

  const hoursOfDay = stats.timesOfAlarms.map((alarm) => alarm.time?.getHours());

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Zeit Zwischen Einsätzen</CardTitle>
        </CardHeader>
        <CardContent>
          <ZeitChart
            stats={stats.times.map((v, i) => ({value: v, index: i}))}
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
          <TimeOfDayChart stats={Array.from({ length: 24 }, (_, v) => ({ timeOfDay: v, value: hoursOfDay.filter((h) => h === v).length ?? 0 }))} />
        </CardContent>
      </Card>
      {JSON.stringify(stats, null, 2)}
    </div>
  );
}

export default Page;