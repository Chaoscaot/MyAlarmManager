import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { UnfinishedAlarms } from "~/app/_components/unfinished/unfinished";
import UnfinishedDialog from "./unfinished-dialog";

export default async function Page() {
  const alarms = await fetchQuery(
    api.alarms.all,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  return <UnfinishedDialog alarms={alarms} />;
}
