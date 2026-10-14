import { act, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { deferred } from "@/test/deferred";
import { renderWithUser } from "@/test/render";
import { scoreContact } from "../actions";
import type { LeadScore } from "../types";
import { AiScoreCard } from "./ai-score-card";

vi.mock("../actions", () => ({ scoreContact: vi.fn() }));

describe("AiScoreCard", () => {
  it("invites the user to score a contact that has no score yet", () => {
    renderWithUser(<AiScoreCard contactId="c1" score={null} reasoning={null} scoredAt={null} />);

    expect(screen.getByText("Not scored yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Score with AI" })).toBeEnabled();
  });

  it("shows the score and reasoning", () => {
    renderWithUser(
      <AiScoreCard contactId="c1" score={72} reasoning="Engaged buyer" scoredAt={null} />,
    );

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Engaged buyer")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Lead score" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Re-score" })).toBeInTheDocument();
  });

  it("shows a pending state while the AI is scoring", async () => {
    const scoring = deferred<ActionResult<LeadScore>>();
    vi.mocked(scoreContact).mockReturnValue(scoring.promise);
    const { user } = renderWithUser(
      <AiScoreCard contactId="c1" score={72} reasoning="Engaged buyer" scoredAt={null} />,
    );

    await user.click(screen.getByRole("button", { name: "Re-score" }));

    expect(scoreContact).toHaveBeenCalledWith("c1");
    expect(await screen.findByText(/Analyzing profile, deals and activities/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Re-score/ })).toBeDisabled();
    expect(screen.queryByText("Engaged buyer")).not.toBeInTheDocument();

    await act(async () => scoring.resolve({ ok: true, data: { score: 80, reasoning: "" } }));
    expect(screen.getByRole("button", { name: "Re-score" })).toBeEnabled();
  });

  it("toasts when scoring succeeds", async () => {
    vi.mocked(scoreContact).mockResolvedValue({ ok: true, data: { score: 80, reasoning: "" } });
    const { user } = renderWithUser(
      <AiScoreCard contactId="c1" score={null} reasoning={null} scoredAt={null} />,
    );

    await user.click(screen.getByRole("button", { name: "Score with AI" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Lead scored"));
  });

  it("shows the friendly warning when AI is not configured", async () => {
    vi.mocked(scoreContact).mockResolvedValue({ ok: false, error: "AI is off", status: 503 });
    const { user } = renderWithUser(
      <AiScoreCard contactId="c1" score={null} reasoning={null} scoredAt={null} />,
    );

    await user.click(screen.getByRole("button", { name: "Score with AI" }));

    await waitFor(() =>
      expect(toast.warning).toHaveBeenCalledWith("AI is unavailable", { description: "AI is off" }),
    );
  });
});
