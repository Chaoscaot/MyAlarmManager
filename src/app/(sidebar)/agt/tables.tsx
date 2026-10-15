"use client";
import { Button } from "~/components/ui/button";
import PageHeader from "~/app/_components/page-header";
import { cn, groupBy } from "~/lib/utils";
import CreateDialog from "./create-dialog";
import type { CheckType } from "./page";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { api } from "#/_generated/api";

export const nameMap: Record<CheckType[number], string> = {
  G26: "G26",
  STRECKE: "Strecke",
  UNTERWEISUNG: "Unterweisung",
  UEBUNG: "Übung",
};

const descriptionMap: Record<CheckType, string> = {
  G26: "Arbeitsmedizinische Vorsorge",
  STRECKE: "Belastungsübung in der Atemschutzstrecke",
  UNTERWEISUNG: "Unterweisung Atemschutz",
  UEBUNG: "Übung unter Atemschutz",
};

/** From this many months before the due date a check is shown as "bald fällig". */
const WARN_MONTHS = 3;

function formatMonth(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function monthsBetween(from: Date, to: Date) {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    to.getMonth() -
    from.getMonth()
  );
}

type CheckState = "valid" | "warning" | "expired" | "missing";

const stateLabel: Record<CheckState, string> = {
  valid: "Gültig",
  warning: "Bald fällig",
  expired: "Abgelaufen",
  missing: "Fehlt",
};

const stateText: Record<CheckState, string> = {
  valid: "text-tauglich",
  warning: "text-feuerrot/80",
  expired: "text-feuerrot",
  missing: "text-feuerrot",
};

const label =
  "text-muted-foreground text-[11px] font-medium tracking-[0.18em] uppercase";

function RequirementCard({
  type,
  check,
  now,
}: Readonly<{
  type: CheckType;
  check?: {
    year: number;
    month: number;
    validity: number;
    nextCheckDate: Date;
  };
  now: Date;
}>) {
  if (!check) {
    return (
      <article className="bg-card flex flex-col gap-4 rounded-lg border p-5">
        <RequirementHeading type={type} state="missing" />
        <p className="text-muted-foreground text-sm">
          Noch kein Nachweis eingetragen.
        </p>
        <div aria-hidden className="bg-feuerrot/25 h-1 rounded-full" />
        <div className="mt-auto flex justify-end">
          <CreateDialog type={type}>
            <Button variant="outline" size="sm">
              Eintragen
            </Button>
          </CreateDialog>
        </div>
      </article>
    );
  }

  const lastDate = new Date(check.year, check.month - 1);
  const isValid = now < check.nextCheckDate;
  const monthsLeft = monthsBetween(now, check.nextCheckDate);
  const state: CheckState = !isValid
    ? "expired"
    : monthsLeft <= WARN_MONTHS
      ? "warning"
      : "valid";

  const total = check.nextCheckDate.getTime() - lastDate.getTime();
  const remaining = Math.min(
    1,
    Math.max(0, (check.nextCheckDate.getTime() - now.getTime()) / total),
  );

  return (
    <article className="bg-card flex flex-col gap-4 rounded-lg border p-5">
      <RequirementHeading type={type} state={state} />
      <dl className="grid grid-cols-3 gap-3">
        <div>
          <dt className={label}>Zuletzt</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {formatMonth(lastDate)}
          </dd>
        </div>
        <div>
          <dt className={label}>Gültig</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {check.validity} {check.validity === 1 ? "Jahr" : "Jahre"}
          </dd>
        </div>
        <div>
          <dt className={label}>Fällig</dt>
          <dd
            className={cn(
              "mt-1 font-semibold tabular-nums",
              state !== "valid" && stateText[state],
            )}
          >
            {formatMonth(check.nextCheckDate)}
          </dd>
        </div>
      </dl>
      <div
        aria-hidden
        className={cn(
          "h-1 overflow-hidden rounded-full",
          state === "expired" ? "bg-feuerrot/25" : "bg-muted",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full",
            state === "valid" ? "bg-tauglich" : "bg-feuerrot/60",
          )}
          style={{ width: `${Math.round(remaining * 100)}%` }}
        />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm tabular-nums">
          {state === "expired"
            ? `Abgelaufen seit ${formatMonth(check.nextCheckDate)}`
            : `Noch ${monthsLeft} ${monthsLeft === 1 ? "Monat" : "Monate"}`}
        </p>
        <CreateDialog type={type}>
          <Button variant="ghost" size="sm">
            Aktualisieren
          </Button>
        </CreateDialog>
      </div>
    </article>
  );
}

function RequirementHeading({
  type,
  state,
}: Readonly<{ type: CheckType; state: CheckState }>) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-2xl leading-none font-bold tracking-wide uppercase">
          {nameMap[type]}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {descriptionMap[type]}
        </p>
      </div>
      <span
        className={cn(
          "font-display shrink-0 text-sm font-semibold tracking-wider uppercase",
          stateText[state],
        )}
      >
        {stateLabel[state]}
      </span>
    </div>
  );
}

export default function AgtPage(props: {
  preloadedLatestChecks: Preloaded<typeof api.agt.latest>;
}) {
  const latestChecks = usePreloadedQuery(props.preloadedLatestChecks);

  const date = new Date();
  const isAble =
    latestChecks.length == 4 &&
    latestChecks.every((check) => {
      const nextCheckDate = new Date(
        check.year + check.validity,
        check.month - 1,
      );
      return date < nextCheckDate;
    });

  const nextChecks = groupBy(
    latestChecks.map((check) => {
      const nextCheckDate = new Date(
        check.year + check.validity,
        check.month - 1,
      );
      return {
        ...check,
        nextCheckDate,
      };
    }),
    "type",
  );

  const types = Object.keys(nameMap) as CheckType[];
  const recorded = types.flatMap((type) => {
    const check = nextChecks[type]?.[0];
    return check ? [{ type, nextCheckDate: check.nextCheckDate }] : [];
  });

  let reason: string;
  if (isAble) {
    const next = recorded.reduce((a, b) =>
      b.nextCheckDate < a.nextCheckDate ? b : a,
    );
    reason = `Nächste Frist: ${nameMap[next.type]} ${formatMonth(next.nextCheckDate)}`;
  } else if (recorded.length === 0) {
    reason = "Noch keine Nachweise eingetragen.";
  } else {
    const expired = recorded
      .filter((check) => date >= check.nextCheckDate)
      .map(
        (check) =>
          `${nameMap[check.type]} abgelaufen seit ${formatMonth(check.nextCheckDate)}`,
      );
    const missing = types
      .filter((type) => !nextChecks[type]?.[0])
      .map((type) => `${nameMap[type]} fehlt`);
    reason = [...expired, ...missing].join(", ");
  }

  return (
    <>
      <PageHeader
        title="Tauglichkeit"
        meta="Atemschutzgeräteträger: G26, Strecke, Unterweisung und Übung"
        actions={
          <CreateDialog>
            <Button>Nachweis eintragen</Button>
          </CreateDialog>
        }
      />
      <div className="flex flex-col gap-6 px-4 md:px-6">
        <section
          aria-label="Status"
          className={cn(
            "bg-card rounded-lg border border-l-4 px-5 py-6",
            isAble ? "border-l-tauglich" : "border-l-feuerrot",
          )}
        >
          <p className={label}>Status Atemschutz</p>
          <p
            className={cn(
              "font-display mt-2 text-5xl leading-none font-bold tracking-wide uppercase sm:text-7xl",
              isAble ? "text-tauglich" : "text-feuerrot",
            )}
          >
            {isAble ? "Tauglich" : "Nicht tauglich"}
          </p>
          <p className="mt-3 text-base tabular-nums">{reason}</p>
        </section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {types.map((type) => (
            <RequirementCard
              key={type}
              type={type}
              check={nextChecks[type]?.[0]}
              now={date}
            />
          ))}
        </div>
      </div>
    </>
  );
}
