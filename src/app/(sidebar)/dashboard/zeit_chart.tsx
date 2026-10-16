"use client";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import React from "react";

const numberFormatter = new Intl.NumberFormat("de", {
  maximumFractionDigits: 1,
});

const axisTick = {
  fill: "hsl(var(--muted-foreground))",
  fontSize: 12,
};

const gridStroke = "hsl(var(--border))";

function TooltipValue({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex w-full items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium tabular-nums">{value}</span>
    </span>
  );
}

export function ZeitChart(props: {
  stats: { index: number; value: number }[];
}) {
  const chartConfig = {
    value: {
      label: "Abstand",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <LineChart
        data={props.stats}
        accessibilityLayer
        margin={{ top: 8, left: 0, right: 8 }}
      >
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis
          dataKey="index"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
          tick={axisTick}
        />
        <ChartTooltip
          cursor={{ stroke: gridStroke }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                `Nach Einsatz ${String((payload[0]?.payload as { index?: number } | undefined)?.index ?? "")}`
              }
              formatter={(value) => (
                <TooltipValue
                  label="Abstand"
                  value={`${numberFormatter.format(Number(value))} Tage`}
                />
              )}
            />
          }
        />
        <Line
          dataKey="value"
          type="monotone"
          stroke="hsl(var(--feuerrot))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: "hsl(var(--feuerrot))", strokeWidth: 0 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function TimeOfDayChart(props: {
  stats: { timeOfDay: number; value: number }[];
}) {
  const chartConfig = {
    value: {
      label: "Einsätze",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <BarChart
        data={props.stats}
        accessibilityLayer
        margin={{ top: 8, left: 0, right: 8 }}
      >
        <CartesianGrid vertical={false} stroke={gridStroke} />
        <XAxis
          dataKey="timeOfDay"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={2}
          tick={axisTick}
          tickFormatter={(hour: number) => String(hour).padStart(2, "0")}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
          tick={axisTick}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const hour =
                  (payload[0]?.payload as { timeOfDay?: number } | undefined)
                    ?.timeOfDay ?? 0;
                return `${String(hour).padStart(2, "0")}–${String((hour + 1) % 24).padStart(2, "0")} Uhr`;
              }}
              formatter={(value) => (
                <TooltipValue
                  label="Einsätze"
                  value={numberFormatter.format(Number(value))}
                />
              )}
            />
          }
        />
        <Bar
          dataKey="value"
          fill="hsl(var(--feuerrot))"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

/** Gone vs. not gone as one horizontal split bar. */
export function GoneSplit(props: { gone: number; notGone: number }) {
  const total = props.gone + props.notGone;
  const goneShare = total > 0 ? (props.gone / total) * 100 : 0;

  return (
    <div>
      <div
        role="img"
        aria-label={`${props.gone} von ${total} Einsätzen gegangen`}
        className="bg-chart-5 flex h-2 w-full overflow-hidden rounded-[2px]"
      >
        <div
          className="bg-feuerrot h-full"
          style={{ width: `${goneShare}%` }}
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted-foreground flex items-center gap-2">
            <span aria-hidden className="bg-feuerrot size-2 rounded-[1px]" />
            Gegangen
          </dt>
          <dd className="font-display mt-0.5 text-xl font-semibold tabular-nums">
            {numberFormatter.format(props.gone)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground flex items-center gap-2">
            <span aria-hidden className="bg-chart-5 size-2 rounded-[1px]" />
            Nicht gegangen
          </dt>
          <dd className="font-display mt-0.5 text-xl font-semibold tabular-nums">
            {numberFormatter.format(props.notGone)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
