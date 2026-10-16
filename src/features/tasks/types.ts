import type { ContactRef } from "@/features/contacts/types";
import type { DealRef } from "@/features/deals/types";
import type { UserRef } from "@/features/users/types";
import type { SortParams } from "@/lib/types";

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
  assignee_id: string | null;
  assignee: UserRef | null;
  contact_id: string | null;
  contact: ContactRef | null;
  deal_id: string | null;
  deal: DealRef | null;
  created_at: string;
  updated_at: string;
};

export type TaskPayload = {
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
};

export type TaskFilters = SortParams & {
  page: number;
  size: number;
  search?: string;
  status?: string;
  assignee_id?: string;
  contact_id?: string;
  deal_id?: string;
  overdue?: boolean;
};
