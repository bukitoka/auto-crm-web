import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { makeStage } from "@/test/factories";
import { createStage, deleteStage, reorderStages, updateStage } from "./stage-actions";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe("createStage", () => {
  it("POSTs the trimmed stage and revalidates the deals pages and dashboard", async () => {
    const stage = makeStage({ name: "Demo" });
    apiFetchMock.mockResolvedValue(stage);

    const result = await createStage({
      name: " Demo ",
      probability: 50,
      is_won: false,
      is_lost: false,
    });

    expect(result).toEqual({ ok: true, data: stage });
    expect(apiFetchMock).toHaveBeenCalledWith("/pipeline/stages", {
      method: "POST",
      body: { name: "Demo", probability: 50, is_won: false, is_lost: false },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/deals", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("validates the input", async () => {
    const result = await createStage({ name: "", probability: 0, is_won: false, is_lost: false });

    expect(result).toEqual({ ok: false, error: "Name is required", status: 422 });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe("updateStage", () => {
  it("PATCHes only the given fields", async () => {
    apiFetchMock.mockResolvedValue(makeStage());

    expect((await updateStage("stage-1", { probability: 30 })).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/pipeline/stages/stage-1", {
      method: "PATCH",
      body: { probability: 30 },
    });
  });

  it("rejects an out-of-range probability", async () => {
    expect((await updateStage("stage-1", { probability: 150 })).ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("returns the API error without revalidating", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(409, "A stage named 'Won' already exists"));

    expect(await updateStage("stage-1", { name: "won" })).toEqual({
      ok: false,
      error: "A stage named 'Won' already exists",
      status: 409,
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("reorderStages", () => {
  it("PUTs the ids in their new order", async () => {
    apiFetchMock.mockResolvedValue([]);

    expect((await reorderStages(["b", "a"])).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/pipeline/stages/order", {
      method: "PUT",
      body: { stage_ids: ["b", "a"] },
    });
  });
});

describe("deleteStage", () => {
  it("DELETEs the stage, passing where to move its deals", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    expect((await deleteStage("stage-1", "stage-2")).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/pipeline/stages/stage-1", {
      method: "DELETE",
      query: { move_to: "stage-2" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/deals", "layout");
  });
});
