import { ArrowUpRight, HandCoins, Sparkles } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActivityList } from "@/features/activities/components/activity-list"
import { getCurrentUser } from "@/features/auth/api"
import { getDashboardSummary } from "@/features/dashboard/api"
import { ClosingSoonList } from "@/features/dashboard/components/closing-soon-list"
import { CountBarChart } from "@/features/dashboard/components/count-bar-chart"
import { FocusCard } from "@/features/dashboard/components/focus-card"
import { KpiCards } from "@/features/dashboard/components/kpi-cards"
import { PipelineChart } from "@/features/dashboard/components/pipeline-chart"
import { TeamLeaderboard } from "@/features/dashboard/components/team-leaderboard"
import { TaskList } from "@/features/tasks/components/task-list"
import { canViewTeam } from "@/features/users/roles"
import { formatCurrency } from "@/lib/format"
import { enumOptions } from "@/lib/options"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Insights" }

function DashboardCard({
  title,
  description,
  href,
  linkText = "View all",
  className,
  children,
}: {
  title: string
  description: string
  href?: string
  linkText?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {href ? (
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link href={href}>
                {linkText}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function chartRows(rows: { key: string; count: number }[]) {
  const labels = enumOptions(rows.map((row) => row.key))
  return rows.map((row, i) => ({ name: labels[i].label, count: row.count }))
}

export default async function DashboardPage() {
  const [user, summary] = await Promise.all([getCurrentUser(), getDashboardSummary()])
  const oversight = canViewTeam(user)
  const statusRows = chartRows(
    summary.contacts_by_status.map(({ status, count }) => ({ key: status, count })),
  )
  const activityRows = chartRows(
    summary.activities_last_30_days.map(({ type, count }) => ({ key: type, count })),
  )

  return (
    <>
      <header className="flex flex-col items-start justify-between gap-5 rounded-lg border border-primary/15 bg-card px-5 py-6 sm:flex-row sm:items-end sm:px-7 dark:border-border">
        <div className="min-w-0 space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight wrap-break-word">
            {oversight ? "Team overview" : "Your workspace"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/deals">View deals</Link>
          </Button>
          <Button asChild>
            <Link href="/assistant">
              <Sparkles aria-hidden /> Help me prioritize
            </Link>
          </Button>
        </div>
      </header>
      <section aria-label="Business overview">
        <KpiCards summary={summary} />
      </section>

      <div className="dashboard-enter grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>Your pipeline</h2>
            </CardTitle>
            <CardDescription>Where deal value sits across your stages</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/deals">
                  Open board
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            {summary.pipeline_by_stage.length > 0 ? (
              <PipelineChart data={summary.pipeline_by_stage} />
            ) : (
              <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 text-center">
                <HandCoins aria-hidden className="size-8 text-muted-foreground" />
                <p className="font-medium">Your next deal starts here.</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Add a deal to see your pipeline take shape, stage by stage.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/deals">Open the deals board</Link>
                </Button>
              </div>
            )}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm">
              <p className="text-muted-foreground">
                Average won deal <span className="text-xs">· Last 90 days</span>
              </p>
              <p className="font-semibold tabular-nums">
                {summary.average_deal_size === null
                  ? "No wins in the last 90 days"
                  : formatCurrency(summary.average_deal_size)}
              </p>
            </div>
          </CardContent>
        </Card>
        <FocusCard summary={summary} oversight={oversight} />
      </div>

      <div className="dashboard-enter grid items-start gap-5 lg:grid-cols-2">
        <DashboardCard
          title="Closing soon"
          description="Deals expected to close in the next 30 days"
          href="/deals?view=table"
          linkText="View deals"
        >
          <ClosingSoonList deals={summary.deals_closing_soon} />
        </DashboardCard>
        <DashboardCard
          title="Recent activity"
          description="The 5 most recent conversations and updates"
        >
          <section
            className="max-h-72 overflow-y-auto rounded-sm px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region needs keyboard focus
            tabIndex={0}
            aria-label="Recent activity updates"
          >
            <ActivityList activities={summary.recent_activities.slice(0, 5)} showLinks compact />
          </section>
        </DashboardCard>
      </div>

      <section aria-labelledby="insights-details" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="insights-details" className="font-heading text-lg font-semibold">
            Contacts and activity
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <DashboardCard
            title="Contacts by status"
            description="How your relationships are progressing"
          >
            <CountBarChart
              data={statusRows}
              label="Contacts"
              color="var(--chart-2)"
              emptyText="No contacts yet. Add a contact to start seeing your funnel."
            />
          </DashboardCard>
          <DashboardCard
            title="Activity mix"
            description="Calls, emails, notes, and meetings over the last 30 days"
          >
            <CountBarChart
              data={activityRows}
              label="Activities"
              color="var(--chart-4)"
              emptyText="No activity logged in the last 30 days."
            />
          </DashboardCard>
          {oversight ? (
            <DashboardCard
              title="Team performance"
              description="Wins this month, open pipeline, and outstanding tasks"
              className="lg:col-span-2"
            >
              <TeamLeaderboard team={summary.team} />
            </DashboardCard>
          ) : (
            <DashboardCard
              title="Your upcoming tasks"
              description="Keep your next follow-ups on track"
              href="/tasks"
              linkText="View tasks"
              className="lg:col-span-2"
            >
              <TaskList
                tasks={summary.my_tasks}
                emptyText="Nothing lined up yet. Plan a follow-up from your tasks page."
              />
            </DashboardCard>
          )}
        </div>
      </section>
    </>
  )
}
