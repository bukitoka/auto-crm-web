import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { makeDeal } from "@/test/factories";
import { createDeal, deleteDeal, moveDealToStage, updateDeal } from "./actions";
import { type DealFormValues, emptyDealForm } from "./schemas";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const form: DealFormValues = {
  ...emptyDealForm("stage-1"),
  title: "Website redesign",
  value: "5000",
};

describe("createDeal", () => {
  it("POSTs the payload and revalidates deals and the dashboard", async () => {
    const deal = makeDeal();
    apiFetchMock.mockResolvedValue(deal);

    expect(await createDeal(form)).toEqual({ ok: true, data: deal });
    expect(apiFetchMock).toHaveBeenCalledWith("/deals", {
      method: "POST",
      body: {
        title: "Website redesign",
        value: 5000,
        currency: "USD",
        stage_id: "stage-1",
        contact_id: null,
        company_id: null,
        owner_id: null,
        expected_close_date: null,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/deals");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("validates the input", async () => {
    expect(await createDeal({ ...form, value: "abc" })).toEqual({
      ok: false,
      error: "Enter an amount",
      status: 422,
    });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(422, "value: must be positive"));

    expect(await createDeal(form)).toMatchObject({ ok: false, status: 422 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("updateDeal", () => {
  it("PATCHes the fields (without stage) and skips /stage when the stage is unchanged", async () => {
    const deal = makeDeal({ stage_id: "stage-1" });
    apiFetchMock.mockResolvedValue(deal);

    const result = await updateDeal("deal-1", { ...form, title: "New title" });

    expect(result).toEqual({ ok: true, data: deal });
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [path, options] = apiFetchMock.mock.calls[0] ?? [];
    expect(path).toBe("/deals/deal-1");
    expect(options?.method).toBe("PATCH");
    expect(options?.body).toMatchObject({ title: "New title", value: 5000 });
    expect(options?.body).not.toHaveProperty("stage_id");
  });

  it("then PATCHes /stage when the stage changed, so the API emits stage events", async () => {
    const moved = makeDeal({ stage_id: "stage-2" });
    apiFetchMock.mockResolvedValueOnce(makeDeal({ stage_id: "stage-1" }));
    apiFetchMock.mockResolvedValueOnce(moved);

    const result = await updateDeal("deal-1", { ...form, stage_id: "stage-2" });

    expect(result).toEqual({ ok: true, data: moved });
    expect(apiFetchMock).toHaveBeenNthCalledWith(2, "/deals/deal-1/stage", {
      method: "PATCH",
      body: { stage_id: "stage-2" },
    });
  });

  it("revalidates the list, dashboard and detail page", async () => {
    apiFetchMock.mockResolvedValue(makeDeal());

    await updateDeal("deal-1", form);

    expect(revalidatePath).toHaveBeenCalledWith("/deals");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/deals/deal-1");
  });

  it("returns the error when the stage change fails", async () => {
    apiFetchMock.mockResolvedValueOnce(makeDeal({ stage_id: "stage-1" }));
    apiFetchMock.mockRejectedValueOnce(new ApiError(404, "Stage not found"));

    const result = await updateDeal("deal-1", { ...form, stage_id: "stage-x" });

    expect(result).toEqual({ ok: false, error: "Stage not found", status: 404 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("validates the input", async () => {
    expect((await updateDeal("deal-1", { ...form, title: "" })).ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe("moveDealToStage", () => {
  it("PATCHes /deals/{id}/stage and revalidates", async () => {
    apiFetchMock.mockResolvedValue(makeDeal({ stage_id: "stage-2" }));

    expect((await moveDealToStage("deal-1", "stage-2")).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/deals/deal-1/stage", {
      method: "PATCH",
      body: { stage_id: "stage-2" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/deals/deal-1");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Deal not found"));

    expect(await moveDealToStage("deal-1", "stage-2")).toMatchObject({ ok: false, status: 404 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteDeal", () => {
  it("DELETEs the deal and revalidates", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    expect((await deleteDeal("deal-1")).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/deals/deal-1", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/deals");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(500, "Oops"));

    expect((await deleteDeal("deal-1")).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
