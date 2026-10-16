import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "#/_generated/api";
import DashboardClient from "~/app/(sidebar)/dashboard/dashboard-client";

export default async function Page() {
  const token = await convexAuthNextjsToken();
  const [preloadedAlarms, preloadedForecast] = await Promise.all([
    preloadQuery(api.stats.get, {}, { token }),
    preloadQuery(api.forecast.get, {}, { token }),
  ]);

  return (
    <DashboardClient
      preloadedAlarms={preloadedAlarms}
      preloadedForecast={preloadedForecast}
    />
  );
}
