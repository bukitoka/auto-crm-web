import { act, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { deferred } from "@/test/deferred";
import { makeTask } from "@/test/factories";
import { renderWithUser } from "@/test/render";
import { setTaskStatus } from "../actions";
import type { Task } from "../types";
import { CompleteTaskButton } from "./complete-task-button";

vi.mock("../actions", () => ({ setTaskStatus: vi.fn() }));

describe("CompleteTaskButton", () => {
  it("marks an open task as done", async () => {
    vi.mocked(setTaskStatus).mockResolvedValue({ ok: true, data: makeTask({ status: "done" }) });
    const { user } = renderWithUser(<CompleteTaskButton taskId="task-1" status="todo" />);

    await user.click(screen.getByRole("button", { name: "Mark as done" }));

    expect(setTaskStatus).toHaveBeenCalledWith("task-1", "done");
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Task completed"));
  });

  it("reopens a done task", async () => {
    vi.mocked(setTaskStatus).mockResolvedValue({ ok: true, data: makeTask() });
    const { user } = renderWithUser(<CompleteTaskButton taskId="task-1" status="done" />);

    await user.click(screen.getByRole("button", { name: "Reopen task" }));

    expect(setTaskStatus).toHaveBeenCalledWith("task-1", "todo");
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Task reopened"));
  });

  it("is disabled while saving", async () => {
    const save = deferred<ActionResult<Task>>();
    vi.mocked(setTaskStatus).mockReturnValue(save.promise);
    const { user } = renderWithUser(<CompleteTaskButton taskId="task-1" status="todo" />);

    await user.click(screen.getByRole("button", { name: "Mark as done" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Mark as done" })).toBeDisabled(),
    );

    await act(async () => save.resolve({ ok: true, data: makeTask({ status: "done" }) }));
    expect(screen.getByRole("button", { name: "Mark as done" })).toBeEnabled();
  });

  it("shows the error when saving fails", async () => {
    vi.mocked(setTaskStatus).mockResolvedValue({ ok: false, error: "Task not found", status: 404 });
    const { user } = renderWithUser(<CompleteTaskButton taskId="task-1" status="todo" />);

    await user.click(screen.getByRole("button", { name: "Mark as done" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Task not found"));
  });
});
