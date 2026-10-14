import { z } from "zod";
import { emptyToNull } from "@/lib/form";
import { toDateInput } from "@/lib/format";
import { TASK_PRIORITIES, TASK_STATUSES, type Task, type TaskPayload } from "./types";

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string(),
  due_date: z.string(),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  assignee_id: z.string(),
  contact_id: z.string(),
  deal_id: z.string(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

export function emptyTaskForm(link: { contactId?: string; dealId?: string } = {}): TaskFormValues {
  return {
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    status: "todo",
    assignee_id: "",
    contact_id: link.contactId ?? "",
    deal_id: link.dealId ?? "",
  };
}

export function taskToForm(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? "",
    due_date: toDateInput(task.due_date),
    priority: task.priority,
    status: task.status,
    assignee_id: task.assignee_id ?? "",
    contact_id: task.contact_id ?? "",
    deal_id: task.deal_id ?? "",
  };
}

export function toTaskPayload(values: TaskFormValues): TaskPayload {
  return emptyToNull(values) as TaskPayload;
}
