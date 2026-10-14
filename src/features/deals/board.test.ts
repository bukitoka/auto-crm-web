import { describe, expect, it } from "vitest";
import { makeDeal, makeStage } from "@/test/factories";
import { groupDealsByStage, moveDeal, stageDotClasses } from "./board";

const lead = makeStage({ id: "lead", name: "Lead", position: 1 });
const proposal = makeStage({ id: "proposal", name: "Proposal", position: 2 });
const won = makeStage({ id: "won", name: "Won", position: 3, is_won: true });
const lost = makeStage({ id: "lost", name: "Lost", position: 4, is_lost: true });

describe("groupDealsByStage", () => {
  it("returns one column per stage in position order, with deals and summed value", () => {
    const deals = [
      makeDeal({ id: "d1", stage_id: "lead", value: "1000.50" }),
      makeDeal({ id: "d2", stage_id: "lead", value: 2000 }),
      makeDeal({ id: "d3", stage_id: "won", value: 500 }),
    ];

    const columns = groupDealsByStage(deals, [won, lead, proposal]);

    expect(columns.map((c) => c.stage.id)).toEqual(["lead", "proposal", "won"]);
    expect(columns[0].deals.map((d) => d.id)).toEqual(["d1", "d2"]);
    expect(columns[0].total).toBe(3000.5);
    expect(columns[1]).toMatchObject({ deals: [], total: 0 });
    expect(columns[2].total).toBe(500);
  });
});

describe("moveDeal", () => {
  it("moves only the given deal and updates its nested stage", () => {
    const deals = [
      makeDeal({ id: "d1", stage_id: "lead" }),
      makeDeal({ id: "d2", stage_id: "lead" }),
    ];

    const moved = moveDeal(deals, "d1", won);

    expect(moved[0]).toMatchObject({
      stage_id: "won",
      stage: { id: "won", name: "Won", is_won: true, is_lost: false },
    });
    expect(moved[1]).toBe(deals[1]);
    expect(deals[0].stage_id).toBe("lead"); // input is not mutated
  });
});

describe("stageDotClasses", () => {
  it("uses a teal ramp for open stages and status colors for won/lost", () => {
    const classes = stageDotClasses([lost, won, proposal, lead]);

    expect(classes).toEqual({
      lead: "bg-teal-300",
      proposal: "bg-teal-500",
      won: "bg-success",
      lost: "bg-destructive",
    });
  });
});
