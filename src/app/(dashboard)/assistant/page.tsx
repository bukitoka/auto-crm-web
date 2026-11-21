import type { Metadata } from "next"
import { z } from "zod"
import { AssistantHome, type TodaySnapshot } from "@/features/assistant/components/assistant-home"
import { AssistantShell } from "@/features/assistant/components/assistant-shell"
import { getCurrentUser } from "@/features/auth/api"
import { getDashboardSummary } from "@/features/dashboard/api"
import { formatCompactCurrency } from "@/lib/format"
import { getParam } from "@/lib/search-params"

export const metadata: Metadata = { title: "Assistant" }

export default async function AssistantPage({ searchParams }: PageProps<"/assistant">) {
  const params = await searchParams
  const document = z.uuid().safeParse(getParam(params, "document"))
  const meeting = z.uuid().safeParse(getParam(params, "meeting"))
  const contact = z.uuid().safeParse(getParam(params, "contact"))
  const initialDraft = document.success
    ? `Read my saved document ${document.data} and summarize the key points and follow-ups.`
    : meeting.success
      ? `For calendar event ${meeting.data}${contact.success ? ` (contact ${contact.data})` : ""}, draft a meeting activity, follow-up tasks, and a recap email from the notes below. Show me the drafts for review before making changes or sending anything.\n\nMeeting notes:\n`
      : undefined
  const [user, summary] = await Promise.all([
    getCurrentUser(),
    // The snapshot is a nice-to-have: the page still works if it fails.
    getDashboardSummary().catch(() => null),
  ])
  const snapshot: TodaySnapshot | null = summary
    ? {
        overdueTasks: summary.overdue_tasks,
        openPipeline: formatCompactCurrency(summary.open_pipeline_value),
        newLeads: summary.new_leads_this_month,
      }
    : null

  return (
    <AssistantShell>
      <AssistantHome
        key={initialDraft}
        firstName={user.full_name.split(" ")[0]}
        snapshot={snapshot}
        initialDraft={initialDraft}
        context={
          meeting.success && !document.success ? { type: "meeting", id: meeting.data } : undefined
        }
      />
    </AssistantShell>
  )
}
