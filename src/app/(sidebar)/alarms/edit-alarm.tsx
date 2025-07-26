import { api } from "#/_generated/api";
import type { Doc, Id } from "#/_generated/dataModel";
import { useMutation } from "convex/react";
import AlarmEditor, {
  type AlarmEditorSchema,
} from "~/app/(sidebar)/alarms/alarm-editor";

export default function EditAlarmDialog({
  onClose,
  alarm,
}: {
  onClose: () => void;
  alarm: Doc<"alarms">;
}) {
  const updateAlarm = useMutation(api.alarms.update);

  async function handleSubmit(date: AlarmEditorSchema | undefined) {
    console.log(date);
    onClose();
    if (date) {
      await updateAlarm({
        ...date,
        id: alarm._id,
        date: date.date?.toISOString() ?? undefined,
        seat: date.seat ?? undefined,
        address: date.address ?? undefined,
        vehicle: (date.vehicle as Id<"vehicles">) ?? undefined,
        gone: date.gone ?? false,
      });
    }
  }

  return (
    <AlarmEditor
      onSubmit={handleSubmit}
      initialValue={{
        ...alarm,
        date: alarm.date ? new Date(alarm.date) : null,
        vehicle: alarm.vehicleId?.toString() ?? null,
        seat: alarm.seat,
        address: alarm.address,
      }}
      submitText="Bearbeiten"
    />
  );
}
