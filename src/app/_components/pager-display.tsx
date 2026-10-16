import type React from "react";
import { cn } from "~/lib/utils";

/**
 * The signature element: an Alamos-style pager (Funkmeldeempfänger) display.
 * Amber dot-matrix text on dark LCD glass inside a plastic bezel.
 * Use it for pager-like content only (alarm messages, forecasts), never as a generic card.
 */
export function PagerDisplay({
  label,
  status,
  children,
  className,
}: Readonly<{
  /** Left bezel label, e.g. "Letzte Meldung". */
  label: string;
  /** Right bezel text, e.g. the time of the message. */
  status?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-black/40 bg-[hsl(216_14%_7%)] p-2 shadow-[0_1px_0_hsl(0_0%_100%/0.04)_inset,0_20px_40px_-20px_hsl(0_0%_0%/0.8)]",
        className,
      )}
    >
      <div className="text-muted-foreground flex items-center justify-between gap-3 px-2 pt-1 pb-2 text-[11px] font-medium tracking-[0.18em] uppercase">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="bg-feuerrot size-1.5 rounded-full shadow-[0_0_6px_hsl(var(--feuerrot))]"
          />
          {label}
        </span>
        {status ? <span className="tabular-nums">{status}</span> : null}
      </div>
      <div className="lcd-glass lcd-text rounded-md px-4 py-4 md:px-5">
        {children}
      </div>
    </div>
  );
}

/** One line of pager text. `line` staggers the type-in animation. */
export function PagerLine({
  line = 0,
  className,
  children,
}: Readonly<{ line?: number; className?: string; children: React.ReactNode }>) {
  return (
    <div
      className={cn("lcd-line", className)}
      style={{ "--line": line } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function PagerCursor() {
  return (
    <span aria-hidden className="lcd-cursor">
      ▌
    </span>
  );
}
