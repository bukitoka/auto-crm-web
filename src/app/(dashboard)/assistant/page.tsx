import type { Metadata } from "next";
import { AssistantHome, type TodaySnapshot } from "@/features/assistant/components/assistant-home";
import { AssistantShell } from "@/features/assistant/components/assistant-shell";
import { getCurrentUser } from "@/features/auth/api";
import { getDashboardSummary } from "@/features/dashboard/api";
import { formatCompactCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Assistant" };

export default async function AssistantPage() {
  const [user, summary] = await Promise.all([
    getCurrentUser(),
    // The snapshot is a nice-to-have: the page still works if it fails.
    getDashboardSummary().catch(() => null),
  ]);
  const snapshot: TodaySnapshot | null = summary
    ? {
        overdueTasks: summary.overdue_tasks,
        openPipeline: formatCompactCurrency(summary.open_pipeline_value),
        newLeads: summary.new_leads_this_month,
      }
    : null;

  return (
    <AssistantShell>
      <AssistantHome firstName={user.full_name.split(" ")[0]} snapshot={snapshot} />
    </AssistantShell>
  );
}
