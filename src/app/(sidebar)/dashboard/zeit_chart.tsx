"use client";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
} from "recharts";
import React from "react";

export function ZeitChart(props: {
  stats: { index: number; value: number }[];
}) {
  const chartConfig = {
    value: {
      label: "Zeit in Tagen zwischen Einsätzen",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        data={props.stats}
        accessibilityLayer
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="index"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Line dataKey="value" type="natural" stroke="red" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  );
}

export function TimeOfDayChart(props: {
  stats: { timeOfDay: number; value: number }[];
}) {
  const chartConfig = {
    value: {
      label: "Einsätze in dieser Stunde",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        data={props.stats}
        accessibilityLayer
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="timeOfDay"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="value" fill="red" radius={2} />
      </BarChart>
    </ChartContainer>
  );
}

export function GonePieChart(props: { gone: number; notGone: number }) {
  const chartConfig = {
    value: {
      label: "Anzahl",
    },
    went: {
      label: "Gegangen",
    },
    not: {
      label: "Nicht gegangen",
    },
  } satisfies ChartConfig;

  const data = [
    { name: "went", value: props.gone, color: "#16a34a" },
    { name: "not", value: props.notGone, color: "#ef4444" },
  ];

  return (
    <ChartContainer config={chartConfig} className="mx-auto max-w-[360px]">
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="name" hideLabel />}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          legendType="circle"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
