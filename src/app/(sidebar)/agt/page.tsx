import { preloadQuery } from "convex/nextjs";
import AgtPage from "./tables";
import { api } from "#/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function Page() {
  const preloadedAgt = await preloadQuery(
    api.agt.latest,
    {},
    {
      token: await convexAuthNextjsToken(),
    },
  );

  return <AgtPage preloadedLatestChecks={preloadedAgt} />;
}

export type CheckType = "G26" | "STRECKE" | "UNTERWEISUNG" | "UEBUNG";
