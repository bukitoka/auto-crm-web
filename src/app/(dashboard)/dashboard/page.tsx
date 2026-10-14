import type { Metadata } from "next";
import Link from "next/link";
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
import { KpiCards } from "@/features/dashboard/components/kpi-cards";
import { PipelineChart } from "@/features/dashboard/components/pipeline-chart";
import { TaskList } from "@/features/tasks/components/task-list";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [user, summary] = await Promise.all([getCurrentUser(), getDashboardSummary()]);
  const firstName = user.full_name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hi, ${firstName}`}
        description="Here's what's happening in your pipeline."
      />
      <KpiCards summary={summary} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline by stage</CardTitle>
            <CardDescription>Total deal value in each stage</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" asChild>
                <Link href="/deals">Open board</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {summary.pipeline_by_stage.length > 0 ? (
              <PipelineChart data={summary.pipeline_by_stage} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No deals yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My tasks</CardTitle>
            <CardDescription>Upcoming work assigned to you</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TaskList tasks={summary.my_tasks} emptyText="Nothing due. Nice!" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest notes, calls, emails and meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityList activities={summary.recent_activities} showLinks />
        </CardContent>
      </Card>
    </>
  );
}
