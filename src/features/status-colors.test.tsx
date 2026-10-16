import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiScoreBadge } from "@/features/ai/components/ai-score-badge";
import { ContactStatusBadge } from "@/features/contacts/components/contact-status-badge";
import { DealStageBadge } from "@/features/deals/components/deal-stage-badge";
import { TaskPriorityBadge, TaskStatusBadge } from "@/features/tasks/components/task-badges";

// Badges expose their variant as `data-variant`, which maps to a status color
// (success = green, warning = amber, info = sky, destructive = red).
function variantOf(text: string | RegExp) {
  return screen.getByText(text).closest("[data-slot=badge]")?.getAttribute("data-variant");
}

describe("status color mapping", () => {
  it.each([
    ["lead", "info"],
    ["prospect", "warning"],
    ["customer", "success"],
    ["churned", "secondary"],
  ] as const)("contact status %s → %s", (status, variant) => {
    render(<ContactStatusBadge status={status} />);
    expect(variantOf(status)).toBe(variant);
  });

  it.each([
    ["low", "secondary"],
    ["medium", "warning"],
    ["high", "destructive"],
  ] as const)("task priority %s → %s", (priority, variant) => {
    render(<TaskPriorityBadge priority={priority} />);
    expect(variantOf(priority)).toBe(variant);
  });

  it.each([
    ["todo", "To do", "outline"],
    ["in_progress", "In progress", "info"],
    ["done", "Done", "success"],
  ] as const)("task status %s → %s", (status, label, variant) => {
    render(<TaskStatusBadge status={status} />);
    expect(variantOf(label)).toBe(variant);
  });

  it("deal stages: won → success, lost → destructive, open → secondary", () => {
    render(
      <>
        <DealStageBadge stage={{ id: "1", name: "Won", is_won: true, is_lost: false }} />
        <DealStageBadge stage={{ id: "2", name: "Lost", is_won: false, is_lost: true }} />
        <DealStageBadge stage={{ id: "3", name: "Proposal", is_won: false, is_lost: false }} />
      </>,
    );
    expect(variantOf("Won")).toBe("success");
    expect(variantOf("Lost")).toBe("destructive");
    expect(variantOf("Proposal")).toBe("secondary");
  });

  it.each([
    [85, "success"],
    [70, "success"],
    [55, "warning"],
    [40, "warning"],
    [12, "secondary"],
  ] as const)("AI score %i → %s", (score, variant) => {
    render(<AiScoreBadge score={score} />);
    expect(variantOf(String(score))).toBe(variant);
  });

  it("AI score shows a dash when not scored", () => {
    render(<AiScoreBadge score={null} />);
    expect(screen.getByText("Not set")).toBeInTheDocument();
  });
});
