import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "#/_generated/api";
import DashboardClient from "~/app/(sidebar)/dashboard/dashboard-client";

export default async function Page() {
  const preloadedAlarms = await preloadQuery(
    api.stats.get,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  return <DashboardClient preloadedAlarms={preloadedAlarms} />;
}
