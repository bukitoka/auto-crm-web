import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityList } from "@/features/activities/components/activity-list";
import { getCurrentUser } from "@/features/auth/api";
import { getDashboardSummary } from "@/features/dashboard/api";
import { ClosingSoonList } from "@/features/dashboard/components/closing-soon-list";
import { CountBarChart } from "@/features/dashboard/components/count-bar-chart";
import { KpiCards } from "@/features/dashboard/components/kpi-cards";
import { PipelineChart } from "@/features/dashboard/components/pipeline-chart";
import { TeamLeaderboard } from "@/features/dashboard/components/team-leaderboard";
import { TaskList } from "@/features/tasks/components/task-list";
import { canViewTeam } from "@/features/users/roles";
import { enumOptions } from "@/lib/options";

export const metadata: Metadata = { title: "Dashboard" };

function DashboardCard({
  title,
  description,
  href,
  linkText = "View all",
  className,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  linkText?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {href ? (
          <CardAction>
            <Button variant="ghost" size="sm" asChild>
              <Link href={href}>{linkText}</Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Chart rows with readable names ("lead" → "Lead"). */
function chartRows(rows: { key: string; count: number }[]) {
  const labels = enumOptions(rows.map((row) => row.key));
  return rows.map((row, i) => ({ name: labels[i].label, count: row.count }));
}

export default async function DashboardPage() {
  const [user, summary] = await Promise.all([getCurrentUser(), getDashboardSummary()]);
  const firstName = user.full_name.split(" ")[0];
  const oversight = canViewTeam(user);
  const statusRows = chartRows(
    summary.contacts_by_status.map(({ status, count }) => ({ key: status, count })),
  );
  const activityRows = chartRows(
    summary.activities_last_30_days.map(({ type, count }) => ({ key: type, count })),
  );

  return (
    <>
      <PageHeader
        title={`Hi, ${firstName}`}
        description={
          oversight
            ? "Here's how every admin's pipeline is doing."
            : "Here's what's happening in your pipeline."
        }
      />
      <KpiCards summary={summary} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Pipeline by stage"
          description="Total deal value in each stage"
          href="/deals"
          linkText="Open board"
        >
          {summary.pipeline_by_stage.length > 0 ? (
            <PipelineChart data={summary.pipeline_by_stage} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No deals yet.</p>
          )}
        </DashboardCard>
        {oversight ? null : (
          <DashboardCard title="My tasks" description="Upcoming work assigned to you" href="/tasks">
            <TaskList tasks={summary.my_tasks} emptyText="Nothing due." />
          </DashboardCard>
        )}
        <DashboardCard
          title="Overdue tasks"
          description={oversight ? "All admins, oldest first" : "Oldest first"}
          href="/tasks?overdue=true"
        >
          <TaskList
            tasks={summary.overdue_task_list}
            emptyText="Nothing overdue."
            showAssignee={oversight}
          />
        </DashboardCard>
        <DashboardCard
          title="Closing soon"
          description="Open deals expected to close in the next 30 days"
          href="/deals?view=table"
        >
          <ClosingSoonList deals={summary.deals_closing_soon} />
        </DashboardCard>
        <DashboardCard
          title="Contacts by status"
          description="Where your contacts are in the funnel"
        >
          <CountBarChart data={statusRows} label="Contacts" />
        </DashboardCard>
        <DashboardCard title="Activity" description="Logged in the last 30 days, by type">
          <CountBarChart data={activityRows} label="Activities" />
        </DashboardCard>
        {oversight ? (
          <DashboardCard
            title="Admins"
            description="Won this month, open pipeline and open tasks per admin"
            className="lg:col-span-2"
          >
            <TeamLeaderboard team={summary.team} />
          </DashboardCard>
        ) : null}
        <DashboardCard
          title="Recent activity"
          description="Latest notes, calls, emails and meetings"
          className="lg:col-span-2"
        >
          <ActivityList activities={summary.recent_activities} showLinks />
        </DashboardCard>
      </div>
    </>
  );
}
