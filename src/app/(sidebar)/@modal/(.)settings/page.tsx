import { auth } from "~/server/auth";
import SettingsDialog from "~/app/(sidebar)/@modal/(.)settings/settings-dialog";

export default async function Settings() {
    const session = await auth();
  return (
      <SettingsDialog session={session!} />
  );
}
