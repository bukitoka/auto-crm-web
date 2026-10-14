import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { makeWebhook } from "@/test/factories";
import { createWebhook, deleteWebhook, toggleWebhook, updateWebhook } from "./actions";
import type { WebhookFormValues } from "./schemas";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const form: WebhookFormValues = {
  event: "deal.won",
  target_url: "http://localhost:5678/webhook/deal-won",
  is_active: true,
};

describe("createWebhook", () => {
  it("POSTs the form and revalidates /automations", async () => {
    const webhook = makeWebhook({ secret: "s3cret" });
    apiFetchMock.mockResolvedValue(webhook);

    expect(await createWebhook(form)).toEqual({ ok: true, data: webhook });
    expect(apiFetchMock).toHaveBeenCalledWith("/webhooks", { method: "POST", body: form });
    expect(revalidatePath).toHaveBeenCalledWith("/automations");
  });

  it("validates the input", async () => {
    expect(await createWebhook({ ...form, event: "" })).toEqual({
      ok: false,
      error: "Pick an event",
      status: 422,
    });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(403, "Admins only"));

    expect(await createWebhook(form)).toMatchObject({ ok: false, status: 403 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("updateWebhook", () => {
  it("PATCHes the subscription", async () => {
    apiFetchMock.mockResolvedValue(makeWebhook());

    expect((await updateWebhook("webhook-1", form)).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/webhooks/webhook-1", {
      method: "PATCH",
      body: form,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/automations");
  });

  it("validates the input", async () => {
    expect((await updateWebhook("webhook-1", { ...form, target_url: "nope" })).ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Not found"));

    expect((await updateWebhook("webhook-1", form)).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("toggleWebhook", () => {
  it("PATCHes only is_active", async () => {
    apiFetchMock.mockResolvedValue(makeWebhook({ is_active: false }));

    expect((await toggleWebhook("webhook-1", false)).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/webhooks/webhook-1", {
      method: "PATCH",
      body: { is_active: false },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/automations");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Not found"));

    expect((await toggleWebhook("webhook-1", true)).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteWebhook", () => {
  it("DELETEs the subscription", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    expect((await deleteWebhook("webhook-1")).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/webhooks/webhook-1", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/automations");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Not found"));

    expect((await deleteWebhook("webhook-1")).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
