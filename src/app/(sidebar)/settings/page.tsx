import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import SettingsPanel from "~/app/_components/settings/settings";

export default async function Page() {
  const user = await fetchQuery(
    api.user.currentuser,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  return <SettingsPanel user={user!!} />;
}
