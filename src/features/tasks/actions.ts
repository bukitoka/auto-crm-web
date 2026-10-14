"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { type TaskFormValues, taskFormSchema, toTaskPayload } from "./schemas";
import type { Task, TaskStatus } from "./types";

function revalidateTask(task?: Task) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  if (task?.contact_id) revalidatePath(`/contacts/${task.contact_id}`);
  if (task?.deal_id) revalidatePath(`/deals/${task.deal_id}`);
}

export async function createTask(values: TaskFormValues): Promise<ActionResult<Task>> {
  const parsed = parseInput(taskFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Task>("/tasks", { method: "POST", body: toTaskPayload(parsed.data) }),
  );
  if (result.ok) revalidateTask(result.data);
  return result;
}

export async function updateTask(id: string, values: TaskFormValues): Promise<ActionResult<Task>> {
  const parsed = parseInput(taskFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Task>(`/tasks/${id}`, { method: "PATCH", body: toTaskPayload(parsed.data) }),
  );
  if (result.ok) revalidateTask(result.data);
  return result;
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<ActionResult<Task>> {
  const result = await runAction(() =>
    apiFetch<Task>(`/tasks/${id}`, { method: "PATCH", body: { status } }),
  );
  if (result.ok) revalidateTask(result.data);
  return result;
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const result = await runAction(() => apiFetch<void>(`/tasks/${id}`, { method: "DELETE" }));
  if (result.ok) revalidateTask();
  return result;
}
