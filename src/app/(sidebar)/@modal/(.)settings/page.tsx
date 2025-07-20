import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import SettingsDialog from "~/app/(sidebar)/@modal/(.)settings/settings-dialog";

export default async function Settings() {
  const user = await fetchQuery(
    api.user.currentuser,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );
  return <SettingsDialog user={user!} />;
}
