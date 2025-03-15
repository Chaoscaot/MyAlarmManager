import React from "react";
import { DataTable } from "~/app/(sidebar)/alarms/table";
import { columns } from "~/app/(sidebar)/alarms/columns";
import { api } from "~/trpc/server";
import CreateAlarmDialog from "./dialogs";

export default async function Page() {
  const alarms = await api.alarms.all();

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex flex-row justify-end gap-4">
        <CreateAlarmDialog />
      </div>
      <DataTable columns={columns} data={alarms} />
    </div>
  );
}
