import { Doc } from "#/_generated/dataModel";
import RowActions from "~/app/(sidebar)/alarms/row-actions";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function UnfinishedAlarms({
  alarms,
}: {
  alarms: Array<{ alarms: Doc<"alarms">; vehicles: Doc<"vehicles"> | null }>;
}) {
  const unfinishedAlarms = alarms.filter(
    (alarm) => alarm.alarms.uneditedFromWebhook,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stichwort</TableHead>
          <TableHead>Am</TableHead>
          <TableHead>Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {unfinishedAlarms.map((alarm) => (
          <TableRow key={alarm.alarms._id}>
            <TableCell>{alarm.alarms.keyword}</TableCell>
            <TableCell>
              {new Date(alarm.alarms.date).toLocaleString()}
            </TableCell>
            <TableCell>
              <RowActions alarm={alarm.alarms} vehicle={alarm.vehicles} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
