import { api, HydrateClient } from "~/trpc/server";
import SettingsPanel from "~/app/_components/settings/settings";
import {auth} from "~/server/auth";

export default async function Page() {
  await api.hooks.list.prefetch();
  const session = await auth()

  return (
      <HydrateClient>
          <SettingsPanel session={session!} />
      </HydrateClient>
  );
}
