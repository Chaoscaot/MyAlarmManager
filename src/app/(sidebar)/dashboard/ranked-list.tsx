import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

const countFormatter = new Intl.NumberFormat("de");

/** Label left, count right, a 2px Feuerrot bar underneath for the share of the top entry. */
export function RankedRow({
  label,
  count,
  max,
}: Readonly<{ label: React.ReactNode; count: number; max: number }>) {
  return (
    <li className="py-2.5">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="min-w-0 truncate">{label}</span>
        <span className="font-display shrink-0 text-base font-semibold tabular-nums">
          {countFormatter.format(count)}
        </span>
      </div>
      <div aria-hidden className="bg-border/60 mt-1.5 h-0.5 w-full">
        <div
          className="bg-feuerrot h-full"
          style={{ width: `${(count / Math.max(max, 1)) * 100}%` }}
        />
      </div>
    </li>
  );
}

export function RankedCard({
  title,
  isEmpty,
  className,
  children,
}: Readonly<{
  title: string;
  isEmpty: boolean;
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="text-muted-foreground py-2.5 text-sm">
            Noch keine Daten
          </p>
        ) : (
          <ol className="-mt-1">{children}</ol>
        )}
      </CardContent>
    </Card>
  );
}
