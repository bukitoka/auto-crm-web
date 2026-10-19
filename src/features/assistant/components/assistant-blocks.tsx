"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { AssistantBlock, ChartBlock, MetricsBlock, TableBlock } from "../types";

/** Distinct hues from the theme tokens, so neighbouring series and slices tell apart. */
const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--info)",
  "var(--warning)",
  "var(--muted-foreground)",
  "var(--chart-4)",
];

const ROW_LINK_PATHS = { contact: "/contacts", company: "/companies", deal: "/deals" } as const;

function formatValue(value: number, unit: ChartBlock["unit"], compact = false): string {
  if (unit === "currency") return compact ? formatCompactCurrency(value) : formatCurrency(value);
  if (unit === "percent") return `${Math.round(value * 10) / 10}%`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function BlockFrame({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <section className="w-full min-w-0 rounded-lg border bg-card p-3">
      {title ? <h3 className="mb-2 text-sm font-medium">{title}</h3> : null}
      {children}
    </section>
  );
}

function ChartView({ block }: { block: ChartBlock }) {
  const config: ChartConfig = Object.fromEntries(
    block.series.map((series, index) => [
      `s${index}`,
      { label: series.name, color: SERIES_COLORS[index % SERIES_COLORS.length] },
    ]),
  );
  const rows = block.categories.map((category, row) => ({
    category,
    ...Object.fromEntries(block.series.map((series, index) => [`s${index}`, series.values[row]])),
  }));
  const axis = {
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
  } as const;
  const tooltip = (
    <ChartTooltip
      cursor={false}
      content={
        <ChartTooltipContent
          formatter={(value, name) => (
            <span className="flex w-full items-center justify-between gap-4">
              <span className="text-muted-foreground">{name}</span>
              <span className="font-medium tabular-nums">
                {formatValue(Number(value), block.unit)}
              </span>
            </span>
          )}
        />
      }
    />
  );

  if (block.kind === "pie") {
    const total = block.series[0].values.reduce((sum, value) => sum + value, 0);
    const slices = rows.map((row, index) => ({
      name: row.category,
      value: block.series[0].values[index],
      fill: SERIES_COLORS[index % SERIES_COLORS.length],
    }));
    return (
      <BlockFrame title={block.title}>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <ChartContainer config={config} className="aspect-square h-40 shrink-0">
            <PieChart>
              {tooltip}
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius={36}
                strokeWidth={2}
                stroke="var(--card)"
              >
                {slices.map((slice) => (
                  <Cell key={slice.name} fill={slice.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="w-full min-w-0 space-y-1 text-sm">
            {slices.map((slice) => (
              <li key={slice.name} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: slice.fill }}
                />
                <span className="min-w-0 flex-1 truncate">{slice.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatValue(slice.value, block.unit, true)}
                  {total > 0 ? ` (${Math.round((slice.value / total) * 100)}%)` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </BlockFrame>
    );
  }

  const legend = block.series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null;
  return (
    <BlockFrame title={block.title}>
      <ChartContainer config={config} className="aspect-auto h-52 w-full">
        {block.kind === "line" ? (
          <LineChart data={rows} margin={{ left: 4, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="category" {...axis} />
            <YAxis
              {...axis}
              width={48}
              tickFormatter={(value: number) => formatValue(value, block.unit, true)}
            />
            {tooltip}
            {legend}
            {block.series.map((series, index) => (
              <Line
                key={series.name}
                dataKey={`s${index}`}
                type="monotone"
                stroke={`var(--color-s${index})`}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={rows} margin={{ left: 4, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="category" {...axis} />
            <YAxis
              {...axis}
              width={48}
              tickFormatter={(value: number) => formatValue(value, block.unit, true)}
            />
            {tooltip}
            {legend}
            {block.series.map((series, index) => (
              <Bar
                key={series.name}
                dataKey={`s${index}`}
                fill={`var(--color-s${index})`}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ChartContainer>
    </BlockFrame>
  );
}

function MetricsView({ block }: { block: MetricsBlock }) {
  return (
    <BlockFrame title={block.title}>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {block.items.map((item) => (
          <div key={item.label} className="min-w-0 rounded-md border p-3">
            <dt className="truncate text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 truncate text-lg font-semibold tabular-nums">{item.value}</dd>
            {item.hint ? (
              <dd className="mt-0.5 text-xs text-muted-foreground">{item.hint}</dd>
            ) : null}
          </div>
        ))}
      </dl>
    </BlockFrame>
  );
}

function TableView({ block, onNavigate }: { block: TableBlock; onNavigate?: () => void }) {
  return (
    <BlockFrame title={block.title}>
      <div className="max-h-72 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {block.columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, rowIndex) => {
              const link = block.row_links?.[rowIndex];
              return (
                // Rows have no ids; the order never changes after the reply is saved.
                // biome-ignore lint/suspicious/noArrayIndexKey: static, append-only content
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: columns are fixed per table
                    <TableCell key={cellIndex} className="whitespace-normal">
                      {cellIndex === 0 && link ? (
                        <Link
                          href={`${ROW_LINK_PATHS[link.entity]}/${link.id}`}
                          onClick={onNavigate}
                          className="font-medium text-primary hover:underline"
                        >
                          {cell ?? ""}
                        </Link>
                      ) : (
                        (cell ?? "")
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </BlockFrame>
  );
}

export function AssistantBlocks({
  blocks,
  onNavigate,
}: {
  blocks: AssistantBlock[];
  onNavigate?: () => void;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "chart") return <ChartView key={key} block={block} />;
        if (block.type === "metrics") return <MetricsView key={key} block={block} />;
        return <TableView key={key} block={block} onNavigate={onNavigate} />;
      })}
    </div>
  );
}
