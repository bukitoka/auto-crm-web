import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { makeDeal, makeStage } from "@/test/factories";
import { renderWithUser } from "@/test/render";
import { moveDealToStage } from "../actions";
import { MoveStageSelect } from "./move-stage-select";

vi.mock("../actions", () => ({ moveDealToStage: vi.fn() }));

const stages = [
  makeStage({ id: "lead", name: "Lead", position: 1 }),
  makeStage({ id: "proposal", name: "Proposal", position: 2 }),
  makeStage({ id: "won", name: "Won", position: 3, is_won: true }),
];

function renderSelect() {
  return renderWithUser(<MoveStageSelect dealId="deal-1" stageId="lead" stages={stages} />);
}

describe("MoveStageSelect", () => {
  it("shows the current stage", () => {
    renderSelect();

    expect(screen.getByRole("combobox", { name: "Move to stage" })).toHaveValue("Lead");
  });

  it("moves the deal and confirms with a toast", async () => {
    vi.mocked(moveDealToStage).mockResolvedValue({ ok: true, data: makeDeal() });
    const { user } = renderSelect();

    await user.click(screen.getByRole("combobox", { name: "Move to stage" }));
    await user.click(screen.getByRole("option", { name: "Proposal" }));

    expect(moveDealToStage).toHaveBeenCalledWith("deal-1", "proposal");
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Moved to Proposal"));
  });

  it("does nothing when the same stage is picked", async () => {
    const { user } = renderSelect();

    await user.click(screen.getByRole("combobox", { name: "Move to stage" }));
    await user.click(screen.getByRole("option", { name: "Lead" }));

    expect(moveDealToStage).not.toHaveBeenCalled();
  });

  it("shows the error when the move fails", async () => {
    vi.mocked(moveDealToStage).mockResolvedValue({
      ok: false,
      error: "Deal not found",
      status: 404,
    });
    const { user } = renderSelect();

    await user.click(screen.getByRole("combobox", { name: "Move to stage" }));
    await user.click(screen.getByRole("option", { name: "Won" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Deal not found"));
  });
});
