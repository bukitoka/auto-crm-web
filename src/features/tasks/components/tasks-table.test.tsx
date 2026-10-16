import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeTask } from "@/test/factories";
import { setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { TasksTable } from "./tasks-table";

vi.mock("../actions", () => ({ deleteTask: vi.fn() }));

describe("TasksTable", () => {
  it("shows when each row was added in a sortable column", () => {
    setUrl("/tasks?sort=created_at&order=desc");
    renderWithUser(
      <TasksTable
        tasks={[makeTask({ title: "Call back", created_at: "2026-03-04T12:00:00Z" })]}
        options={{ contacts: [], deals: [] }}
      />,
    );

    const header = screen.getByRole("columnheader", { name: "Added" });
    expect(header).toHaveAttribute("aria-sort", "descending");
    const row = screen.getByRole("row", { name: /Call back/ });
    expect(within(row).getByText("Mar 4, 2026")).toHaveAttribute(
      "datetime",
      "2026-03-04T12:00:00Z",
    );
  });

  it("hides complete and row actions for read-only viewers", () => {
    renderWithUser(
      <TasksTable
        tasks={[makeTask({ title: "Call back" })]}
        options={{ contacts: [], deals: [] }}
        readOnly
      />,
    );

    expect(screen.queryByRole("button", { name: "Mark as done" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit task" })).not.toBeInTheDocument();
  });
});
