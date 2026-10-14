import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { makePage, makeTask } from "@/test/factories";
import { getTask, listTasks, taskFiltersFromParams } from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);

describe("taskFiltersFromParams", () => {
  it("reads the list params and status", () => {
    expect(taskFiltersFromParams({ page: "2", search: "call", status: "todo" })).toEqual({
      page: 2,
      size: 20,
      search: "call",
      status: "todo",
      overdue: undefined,
    });
  });

  it("only sends overdue when it is exactly 'true'", () => {
    expect(taskFiltersFromParams({ overdue: "true" }).overdue).toBe(true);
    expect(taskFiltersFromParams({ overdue: "false" }).overdue).toBeUndefined();
    expect(taskFiltersFromParams({}).overdue).toBeUndefined();
  });
});

describe("tasks api", () => {
  it("listTasks sends the filters as query params", async () => {
    apiFetchMock.mockResolvedValue(makePage([]));

    await listTasks({ page: 1, size: 20, status: "todo", overdue: true });

    expect(apiFetchMock).toHaveBeenCalledWith("/tasks", {
      query: { page: 1, size: 20, status: "todo", overdue: true },
    });
  });

  it("getTask fetches one task", async () => {
    apiFetchMock.mockResolvedValue(makeTask());

    await getTask("task-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/tasks/task-1");
  });
});
