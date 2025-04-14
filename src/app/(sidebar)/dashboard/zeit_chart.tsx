"use client";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
