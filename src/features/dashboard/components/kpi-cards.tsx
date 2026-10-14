import {
  AlarmClock,
  ArrowUpRight,
  CircleCheck,
  HandCoins,
  type LucideIcon,
  Trophy,
  UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "../types";

/**
 * Color per card, built from the semantic tokens so light and dark mode both work.
 * Class names are written out in full because Tailwind only generates classes it can see.
 */
const TONES = {
  primary: {
    card: "border-primary/20 from-primary/15 via-primary/5 hover:border-primary/50",
    icon: "bg-primary text-primary-foreground",
    accent: "text-primary",
  },
  success: {
    card: "border-success/20 from-success/15 via-success/5 hover:border-success/50",
    icon: "bg-success text-success-foreground",
    accent: "text-success",
  },
  info: {
    card: "border-info/20 from-info/15 via-info/5 hover:border-info/50",
    icon: "bg-info text-info-foreground",
    accent: "text-info",
  },
  destructive: {
    card: "border-destructive/20 from-destructive/15 via-destructive/5 hover:border-destructive/50",
    icon: "bg-destructive text-destructive-foreground",
    accent: "text-destructive",
  },
} as const;

type Kpi = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  href: string;
};

export function KpiCards({ summary }: { summary: DashboardSummary }) {
  const hasOverdue = summary.overdue_tasks > 0;
  const kpis: Kpi[] = [
    {
      label: "Open pipeline",
      value: formatCurrency(summary.open_pipeline_value),
      hint: "View the board",
      icon: HandCoins,
      tone: "primary",
      href: "/deals",
    },
    {
      label: "Won this month",
      value: formatCurrency(summary.won_this_month_value),
      hint: "See won deals",
      icon: Trophy,
      tone: "success",
      href: "/deals?view=table",
    },
    {
      label: "New leads this month",
      value: String(summary.new_leads_this_month),
      hint: "Open leads",
      icon: UserRoundPlus,
      tone: "info",
      href: "/contacts?status=lead",
    },
    {
      label: "Overdue tasks",
      value: String(summary.overdue_tasks),
      hint: hasOverdue ? "Needs attention" : "All caught up",
      // Green check when nothing is overdue, red alarm otherwise.
      icon: hasOverdue ? AlarmClock : CircleCheck,
      tone: hasOverdue ? "destructive" : "success",
      href: "/tasks?overdue=true",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const tone = TONES[kpi.tone];
        return (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={cn(
              "group relative flex flex-col gap-4 overflow-hidden rounded-lg border bg-card bg-linear-to-br to-card p-5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              tone.card,
            )}
          >
            {/* Large faded icon as a background decoration. */}
            <kpi.icon
              aria-hidden
              className={cn(
                "pointer-events-none absolute -right-4 -bottom-5 size-28 opacity-10 transition-transform group-hover:scale-110",
                tone.accent,
              )}
            />
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-md",
                  tone.icon,
                )}
              >
                <kpi.icon className="size-5" />
              </span>
              <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{kpi.value}</p>
            <span className={cn("flex items-center gap-1 text-xs font-medium", tone.accent)}>
              {kpi.hint}
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
