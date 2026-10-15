"use client";

import Link from "next/link";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "#/_generated/api";

export default function AlarmsMeta(props: {
  preloadedAlarms: Preloaded<typeof api.alarms.all>;
}) {
  const alarms = usePreloadedQuery(props.preloadedAlarms) ?? [];
  const unfinished = alarms.filter(
    (alarm) => alarm.alarms.uneditedFromWebhook,
  ).length;

  return (
    <span className="tabular-nums">
      {alarms.length} erfasst
      {unfinished > 0 && (
        <>
          {", "}
          <Link
            href="/unfinished"
            className="text-foreground decoration-feuerrot focus-visible:ring-ring/50 rounded-sm underline decoration-1 underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-[3px]"
          >
            {unfinished} unvollständig
          </Link>
        </>
      )}
    </span>
  );
}
