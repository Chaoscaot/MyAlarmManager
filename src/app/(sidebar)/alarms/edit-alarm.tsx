import AlarmEditor, {AlarmEditorSchema} from "~/app/(sidebar)/alarms/alarm-editor";
import {type SelectAlarm} from "~/server/db/schema";
import {api} from "~/trpc/react";

export default function EditAlarmDialog({ onClose, alarm }: { onClose: () => void, alarm: SelectAlarm }) {
    const utils = api.useUtils();
    const editAlarm = api.alarms.edit.useMutation({
      async onSettled() {
        await utils.alarms.all.invalidate();
      },
    });

    function handleSubmit(date: AlarmEditorSchema | undefined): void {
        console.log(date)
        onClose()
        if (date) {
            editAlarm.mutate({
                ...date,
                id: alarm.id,
            })
        }
    }

    return (
        <AlarmEditor onSubmit={handleSubmit} initialValue={{
            ...alarm,
            vehicle: alarm.vehicle,
            seat: alarm.seat,
            address: alarm.address
        }} submitText="Bearbeiten" />
    );
}