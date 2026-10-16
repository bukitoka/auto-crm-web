"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function CountBarChart({
  data,
  label,
}: {
  data: { name: string; count: number }[];
  /** Tooltip label for the value, e.g. "Contacts". */
  label: string;
}) {
  const chartConfig = { count: { label, color: "var(--chart-1)" } } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 32 }}>
        <XAxis type="number" dataKey="count" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={80}
          tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} barSize={20}>
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            className="fill-foreground tabular-nums"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
