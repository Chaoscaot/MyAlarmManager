import type React from "react";

export default function PageHeader({
  title,
  meta,
  actions,
}: Readonly<{
  title: string;
  /** Short factual line under the title, e.g. "47 Einsätze erfasst". */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-6 md:flex-row md:items-end md:justify-between md:px-6">
      <div className="min-w-0">
        <h1 className="font-display text-4xl leading-none font-bold tracking-wide uppercase md:text-5xl">
          {title}
        </h1>
        {meta ? (
          <p className="text-muted-foreground mt-2 text-sm">{meta}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
