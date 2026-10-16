import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { makeTask } from "@/test/factories";
import { createTask, deleteTask, setTaskStatus, updateTask } from "./actions";
import { emptyTaskForm, type TaskFormValues } from "./schemas";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const form: TaskFormValues = { ...emptyTaskForm(), title: "Call Jane" };

const expectedPayload = {
  title: "Call Jane",
  description: null,
  due_date: null,
  priority: "medium",
  status: "todo",
  contact_id: null,
  deal_id: null,
};

describe("createTask", () => {
  it("POSTs the payload and revalidates tasks and the dashboard", async () => {
    const task = makeTask();
    apiFetchMock.mockResolvedValue(task);

    expect(await createTask(form)).toEqual({ ok: true, data: task });
    expect(apiFetchMock).toHaveBeenCalledWith("/tasks", { method: "POST", body: expectedPayload });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("also revalidates the linked contact and deal pages", async () => {
    apiFetchMock.mockResolvedValue(makeTask({ contact_id: "c1", deal_id: "d1" }));

    await createTask({ ...form, contact_id: "c1", deal_id: "d1" });

    expect(revalidatePath).toHaveBeenCalledWith("/contacts/c1");
    expect(revalidatePath).toHaveBeenCalledWith("/deals/d1");
  });

  it("validates the input", async () => {
    expect(await createTask({ ...form, title: "" })).toEqual({
      ok: false,
      error: "Title is required",
      status: 422,
    });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(422, "due_date: invalid"));

    expect((await createTask(form)).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("updateTask", () => {
  it("PATCHes the task", async () => {
    apiFetchMock.mockResolvedValue(makeTask());

    expect((await updateTask("task-1", form)).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/tasks/task-1", {
      method: "PATCH",
      body: expectedPayload,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("validates the input", async () => {
    expect((await updateTask("task-1", { ...form, title: "" })).ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Task not found"));

    expect((await updateTask("task-1", form)).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("setTaskStatus", () => {
  it("PATCHes only the status", async () => {
    apiFetchMock.mockResolvedValue(makeTask({ status: "done", deal_id: "d1" }));

    expect((await setTaskStatus("task-1", "done")).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/tasks/task-1", {
      method: "PATCH",
      body: { status: "done" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/deals/d1");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Task not found"));

    expect(await setTaskStatus("task-1", "done")).toMatchObject({ ok: false, status: 404 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteTask", () => {
  it("DELETEs the task and revalidates", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    expect((await deleteTask("task-1")).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/tasks/task-1", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Task not found"));

    expect((await deleteTask("task-1")).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
