import React from "react";
import { DataTable } from "~/app/(sidebar)/alarms/table";
import CreateAlarmDialog from "./add-dialog";
import ExportAlarmsButton from "./export-alarms-button";
import AlarmsMeta from "./alarms-meta";
import PageHeader from "~/app/_components/page-header";
import { api } from "#/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function Page() {
  const preloadedAlarms = await preloadQuery(
    api.alarms.all,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  return (
    <>
      <PageHeader
        title="Einsätze"
        meta={<AlarmsMeta preloadedAlarms={preloadedAlarms} />}
        actions={
          <>
            <ExportAlarmsButton preloadedAlarms={preloadedAlarms} />
            <CreateAlarmDialog />
          </>
        }
      />
      <div className="px-4 md:px-6">
        <DataTable preloadedAlarms={preloadedAlarms} />
      </div>
    </>
  );
}
