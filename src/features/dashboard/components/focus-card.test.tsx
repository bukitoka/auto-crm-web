import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { makeTask } from "@/test/factories"
import { renderWithUser } from "@/test/render"
import type { DashboardSummary } from "../types"
import { FocusCard } from "./focus-card"

const summary: DashboardSummary = {
  open_pipeline_value: 0,
  won_this_month_value: 0,
  deals_won_this_month: 0,
  deals_lost_this_month: 0,
  win_rate: null,
  average_deal_size: null,
  new_leads_this_month: 0,
  overdue_tasks: 4,
  tasks_due_today: 2,
  tasks_due_this_week: 6,
  pipeline_by_stage: [],
  contacts_by_status: [],
  activities_last_30_days: [],
  overdue_task_list: [1, 2, 3, 4].map((i) => makeTask({ id: `t${i}`, title: `Follow-up ${i}` })),
  deals_closing_soon: [],
  team: [],
  recent_activities: [],
  my_tasks: [],
}

describe("FocusCard", () => {
  it("previews three overdue follow-ups and links to the full overdue list", () => {
    renderWithUser(<FocusCard summary={summary} oversight={false} />)

    expect(screen.getByText("Follow-up 1")).toBeInTheDocument()
    expect(screen.getByText("Follow-up 3")).toBeInTheDocument()
    expect(screen.queryByText("Follow-up 4")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Review overdue tasks" })).toHaveAttribute(
      "href",
      "/tasks?overdue=true",
    )
    expect(screen.getAllByRole("button", { name: "Mark as done" })).toHaveLength(3)
  })

  it("keeps the team overview read-only for super admins", () => {
    renderWithUser(<FocusCard summary={summary} oversight />)

    expect(screen.getByText("Follow-ups across your team")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Mark as done" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Review overdue tasks" })).toBeInTheDocument()
  })

  it("offers upcoming tasks rather than overdue work when caught up", () => {
    renderWithUser(
      <FocusCard
        summary={{ ...summary, overdue_tasks: 0, overdue_task_list: [] }}
        oversight={false}
      />,
    )

    expect(screen.getByText("You’re caught up on overdue tasks.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Plan my next follow-up" })).toHaveAttribute(
      "href",
      "/tasks",
    )
    expect(screen.queryByRole("link", { name: "Review overdue tasks" })).not.toBeInTheDocument()
  })
})
