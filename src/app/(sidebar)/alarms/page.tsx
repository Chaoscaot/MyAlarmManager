import React from "react";
import { DataTable } from "~/app/(sidebar)/alarms/table";
import CreateAlarmDialog from "./add-dialog";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex flex-row justify-end gap-4">
        <CreateAlarmDialog />
      </div>
      <DataTable />
    </div>
  );
}
