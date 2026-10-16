import type { Activity, ActivityType } from "@/features/activities/types";
import type { ContactStatus } from "@/features/contacts/types";
import type { Deal } from "@/features/deals/types";
import type { Task } from "@/features/tasks/types";
import type { UserRef } from "@/features/users/types";

export type PipelineStageSummary = {
  stage_id: string;
  stage_name: string;
  deal_count: number;
  total_value: number | string;
};

export type TeamMemberStats = {
  user: UserRef;
  open_deals_value: number;
  won_this_month_value: number;
  open_tasks: number;
};

export type DashboardSummary = {
  open_pipeline_value: number | string;
  won_this_month_value: number | string;
  deals_won_this_month: number;
  deals_lost_this_month: number;
  /** won / (won + lost) closed in the last 90 days, 0–1; null when nothing closed. */
  win_rate: number | null;
  /** Mean value of deals won in the last 90 days; null when none were won. */
  average_deal_size: number | null;
  new_leads_this_month: number;
  overdue_tasks: number;
  tasks_due_today: number;
  tasks_due_this_week: number;
  pipeline_by_stage: PipelineStageSummary[];
  contacts_by_status: { status: ContactStatus; count: number }[];
  activities_last_30_days: { type: ActivityType; count: number }[];
  overdue_task_list: Task[];
  deals_closing_soon: Deal[];
  team: TeamMemberStats[];
  recent_activities: Activity[];
  my_tasks: Task[];
};
