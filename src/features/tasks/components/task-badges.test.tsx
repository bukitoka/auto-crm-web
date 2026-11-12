import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TaskPriorityBadge, TaskStatusBadge } from "./task-badges"

describe("TaskPriorityBadge", () => {
  it.each([
    ["low", "secondary"],
    ["medium", "warning"],
    ["high", "destructive"],
  ] as const)("maps %s to %s", (priority, variant) => {
    render(<TaskPriorityBadge priority={priority} />)
    expect(screen.getByText(priority)).toHaveAttribute("data-variant", variant)
  })
})

describe("TaskStatusBadge", () => {
  it.each([
    ["todo", "To do", "outline"],
    ["in_progress", "In progress", "info"],
    ["done", "Done", "success"],
  ] as const)("maps %s to %s with variant %s", (status, label, variant) => {
    render(<TaskStatusBadge status={status} />)
    expect(screen.getByText(label)).toHaveAttribute("data-variant", variant)
  })
})
