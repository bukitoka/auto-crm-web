"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { PipelineStageSummary } from "../types";

const chartConfig = {
  total_value: { label: "Value", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function PipelineChart({ data }: { data: PipelineStageSummary[] }) {
  const rows = data.map((stage) => ({
    stage: stage.stage_name,
    total_value: Number(stage.total_value),
    deal_count: stage.deal_count,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={rows} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="stage" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <div className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">
                    {item.payload.deal_count} deal{item.payload.deal_count === 1 ? "" : "s"}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatCurrency(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="total_value" fill="var(--color-total_value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
