import type { DndContextProps } from "@dnd-kit/core";
import { act, screen, within } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { deferred } from "@/test/deferred";
import { makeDeal, makeStage } from "@/test/factories";
import { renderWithUser } from "@/test/render";
import { moveDealToStage } from "../actions";
import type { Deal } from "../types";
import { DealsCanvas } from "./deals-canvas";

vi.mock("../actions", () => ({ moveDealToStage: vi.fn() }));
vi.mock("../stage-actions", () => ({ createStage: vi.fn() }));

// jsdom has no layout, so real pointer dragging can't be simulated.
// Instead we capture the DndContext props and call its drag handlers directly.
let dnd: DndContextProps;
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    DndContext: (props: DndContextProps) => {
      dnd = props;
      return <actual.DndContext {...props} />;
    },
  };
});

const stages = [
  makeStage({ id: "lead", name: "Lead", position: 1 }),
  makeStage({ id: "won", name: "Won", position: 2, is_won: true }),
];

const deals = [
  makeDeal({ id: "d1", title: "Website", value: "1000.00", stage_id: "lead" }),
  makeDeal({ id: "d2", title: "Mobile app", value: 2500, stage_id: "lead" }),
];

function lane(name: string) {
  return within(screen.getByRole("region", { name }));
}

function drop(dealId: string, stageId: string | null) {
  act(() => {
    dnd.onDragEnd?.({
      active: { id: dealId },
      over: stageId ? { id: stageId } : null,
    } as Parameters<NonNullable<DndContextProps["onDragEnd"]>>[0]);
  });
}

describe("DealsCanvas", () => {
  beforeEach(() => {
    vi.mocked(moveDealToStage).mockReset();
  });

  it("renders a lane per stage with its deals, count and total", () => {
    renderWithUser(<DealsCanvas deals={deals} stages={stages} />);

    const lead = lane("Lead");
    expect(lead.getByText("2 deals")).toBeInTheDocument();
    expect(lead.getByText("$3,500")).toBeInTheDocument();
    expect(lead.getByRole("link", { name: "Website" })).toHaveAttribute("href", "/deals/d1");
    expect(lead.getByRole("button", { name: "Move Website" })).toBeInTheDocument();

    expect(lane("Won").getByText("Drop deals here")).toBeInTheDocument();
  });

  it("moves a dropped deal immediately, then saves it", async () => {
    const save = deferred<ActionResult<Deal>>();
    vi.mocked(moveDealToStage).mockReturnValue(save.promise);
    renderWithUser(<DealsCanvas deals={deals} stages={stages} />);

    drop("d1", "won");

    // Optimistic: already in the Won lane while the request is pending.
    expect(lane("Won").getByRole("link", { name: "Website" })).toBeInTheDocument();
    expect(lane("Lead").getByText("1 deals")).toBeInTheDocument();
    expect(moveDealToStage).toHaveBeenCalledWith("d1", "won");

    await act(async () => save.resolve({ ok: true, data: makeDeal({ id: "d1" }) }));
    expect(toast.success).toHaveBeenCalledWith("Moved “Website” to Won");
  });

  it("snaps the deal back and shows an error when saving fails", async () => {
    vi.mocked(moveDealToStage).mockResolvedValue({ ok: false, status: 500, error: "Boom" });
    renderWithUser(<DealsCanvas deals={deals} stages={stages} />);

    await act(async () => drop("d1", "won"));

    expect(toast.error).toHaveBeenCalledWith("Boom");
    expect(lane("Lead").getByRole("link", { name: "Website" })).toBeInTheDocument();
    expect(lane("Won").queryByRole("link", { name: "Website" })).not.toBeInTheDocument();
  });

  it("ignores drops outside a lane or on the same stage", () => {
    renderWithUser(<DealsCanvas deals={deals} stages={stages} />);

    drop("d1", null);
    drop("d1", "lead");

    expect(moveDealToStage).not.toHaveBeenCalled();
  });

  it("shows the add-stage lane only to pipeline editors", () => {
    const { rerender } = renderWithUser(<DealsCanvas deals={deals} stages={stages} />);
    expect(screen.queryByRole("region", { name: "Add stage" })).not.toBeInTheDocument();

    rerender(<DealsCanvas deals={deals} stages={stages} canEditPipeline />);
    expect(screen.getByRole("region", { name: "Add stage" })).toBeInTheDocument();
  });
});
