import {
  ArrowUpRight,
  HandCoins,
  type LucideIcon,
  Percent,
  Trophy,
  UserRoundPlus,
} from "lucide-react"
import Link from "next/link"
import { colorTones } from "@/lib/color-tones"
import { formatCompactCurrency, formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { DashboardSummary } from "../types"

type Kpi = {
  label: string
  value: string
  exactValue?: string
  detail: string
  icon: LucideIcon
  tone: keyof typeof colorTones
  href: string
}

export function KpiCards({ summary }: { summary: DashboardSummary }) {
  const kpis: Kpi[] = [
    {
      label: "Open pipeline",
      value: formatCompactCurrency(summary.open_pipeline_value),
      exactValue: formatCurrency(summary.open_pipeline_value),
      detail: "Value of deals still in play",
      icon: HandCoins,
      tone: "primary",
      href: "/deals",
    },
    {
      label: "Won this month",
      value: formatCompactCurrency(summary.won_this_month_value),
      exactValue: formatCurrency(summary.won_this_month_value),
      detail: `${summary.deals_won_this_month} won · ${summary.deals_lost_this_month} lost this month`,
      icon: Trophy,
      tone: "success",
      href: "/deals?view=table",
    },
    {
      label: "Win rate",
      value: summary.win_rate === null ? "No data yet" : `${Math.round(summary.win_rate * 100)}%`,
      detail: "Of closed deals, last 90 days",
      icon: Percent,
      tone: "success",
      href: "/deals?view=table",
    },
    {
      label: "New leads",
      value: String(summary.new_leads_this_month),
      detail: "Added this month",
      icon: UserRoundPlus,
      tone: "info",
      href: "/contacts?status=lead",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Link
          key={kpi.label}
          href={kpi.href}
          className="dashboard-enter group min-w-0 rounded-lg border bg-card p-4 outline-none transition-colors hover:border-primary/45 focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md",
                colorTones[kpi.tone],
              )}
            >
              <kpi.icon aria-hidden className="size-4" />
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium text-muted-foreground">
              {kpi.label}
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground group-hover:text-primary motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
            />
          </div>
          <p
            title={kpi.exactValue}
            className="mt-4 text-2xl font-semibold tracking-tight wrap-break-word tabular-nums sm:text-3xl"
          >
            {kpi.value}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">{kpi.detail}</p>
        </Link>
      ))}
    </div>
  )
}
