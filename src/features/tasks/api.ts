import "server-only";
import { apiFetch } from "@/lib/api-client";
import { getListParams, getParam, getSortParams } from "@/lib/search-params";
import type { Paginated, SearchParams } from "@/lib/types";
import type { Task, TaskFilters } from "./types";

export function taskFiltersFromParams(params: SearchParams): TaskFilters {
  return {
    ...getListParams(params),
    ...getSortParams(params),
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
