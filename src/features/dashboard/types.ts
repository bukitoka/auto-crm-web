import type { Activity } from "@/features/activities/types";
import type { Task } from "@/features/tasks/types";

export type PipelineStageSummary = {
  stage_id: string;
  stage_name: string;
  deal_count: number;
  total_value: number | string;
};

export type DashboardSummary = {
  open_pipeline_value: number | string;
  won_this_month_value: number | string;
  new_leads_this_month: number;
  overdue_tasks: number;
  pipeline_by_stage: PipelineStageSummary[];
  recent_activities: Activity[];
  my_tasks: Task[];
};
