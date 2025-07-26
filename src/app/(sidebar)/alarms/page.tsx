import React from "react";
import { DataTable } from "~/app/(sidebar)/alarms/table";
import CreateAlarmDialog from "./add-dialog";
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
    <div className="flex flex-col gap-4 px-4">
      <div className="flex flex-row justify-end gap-4">
        <CreateAlarmDialog />
      </div>
      <DataTable preloadedAlarms={preloadedAlarms} />
    </div>
  );
}
