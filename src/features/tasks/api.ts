import "server-only";
import { apiFetch } from "@/lib/api-client";
import { getListParams, getParam } from "@/lib/search-params";
import type { Paginated, SearchParams } from "@/lib/types";
import type { Task, TaskFilters } from "./types";

/** Filters for the tasks list page, read from its URL. */
export function taskFiltersFromParams(params: SearchParams): TaskFilters {
  return {
    ...getListParams(params),
    status: getParam(params, "status"),
    overdue: getParam(params, "overdue") === "true" ? true : undefined,
  };
}

export function listTasks(filters: TaskFilters) {
  return apiFetch<Paginated<Task>>("/tasks", { query: filters });
}

export function getTask(id: string) {
  return apiFetch<Task>(`/tasks/${id}`);
}
