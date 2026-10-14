import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import { makeDeal, makePage, makeStage } from "@/test/factories";
import {
  BOARD_SIZE,
  dealsQueryFromParams,
  getDeal,
  listDealOptions,
  listDeals,
  listStages,
} from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);

describe("dealsQueryFromParams", () => {
  it("defaults to the board, which loads one big page and ignores paging and stage", () => {
    expect(dealsQueryFromParams({ page: "3", stage_id: "s1", search: "web" })).toEqual({
      view: "board",
      filters: { page: 1, size: BOARD_SIZE, search: "web" },
    });
  });

  it("uses page, size, search and stage for the table view", () => {
    expect(
      dealsQueryFromParams({ view: "table", page: "3", size: "10", search: "web", stage_id: "s1" }),
    ).toEqual({
      view: "table",
      filters: { page: 3, size: 10, search: "web", stage_id: "s1" },
    });
  });

  it("treats unknown views as the board", () => {
    expect(dealsQueryFromParams({ view: "calendar" }).view).toBe("board");
  });
});

describe("deals api", () => {
  it("listDeals sends the filters as query params", async () => {
    apiFetchMock.mockResolvedValue(makePage([]));

    await listDeals({ page: 1, size: 20, stage_id: "s1" });

    expect(apiFetchMock).toHaveBeenCalledWith("/deals", {
      query: { page: 1, size: 20, stage_id: "s1" },
    });
  });

  it("getDeal fetches one deal", async () => {
    apiFetchMock.mockResolvedValue(makeDeal());

    await getDeal("deal-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/deals/deal-1");
  });

  it("listStages sorts stages by position (plain array response)", async () => {
    apiFetchMock.mockResolvedValue([
      makeStage({ id: "won", position: 3 }),
      makeStage({ id: "lead", position: 1 }),
      makeStage({ id: "proposal", position: 2 }),
    ]);

    const stages = await listStages();

    expect(stages.map((stage) => stage.id)).toEqual(["lead", "proposal", "won"]);
    expect(apiFetchMock).toHaveBeenCalledWith("/pipeline/stages");
  });

  it("listStages also accepts a paginated response", async () => {
    apiFetchMock.mockResolvedValue(
      makePage([makeStage({ id: "b", position: 2 }), makeStage({ id: "a", position: 1 })]),
    );

    expect((await listStages()).map((stage) => stage.id)).toEqual(["a", "b"]);
  });

  it("listDealOptions returns { id, title } refs", async () => {
    apiFetchMock.mockResolvedValue(makePage([makeDeal({ id: "d1", title: "Big deal" })]));

    expect(await listDealOptions()).toEqual([{ id: "d1", title: "Big deal" }]);
    expect(apiFetchMock).toHaveBeenCalledWith("/deals", {
      query: { page: 1, size: PICKER_PAGE_SIZE },
    });
  });
});
