import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { UnfinishedPage } from "~/app/_components/unfinished/unfinished";

export default async function Page() {
  const alarms = await fetchQuery(
    api.alarms.all,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  return <UnfinishedPage alarms={alarms} />;
}
