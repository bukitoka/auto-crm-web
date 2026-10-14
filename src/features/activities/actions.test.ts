import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { createActivity, deleteActivity } from "./actions";
import { type ActivityFormValues, emptyActivityForm } from "./schemas";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const form: ActivityFormValues = {
  ...emptyActivityForm({ contactId: "c1" }),
  type: "call",
  subject: "Intro call",
};

describe("createActivity", () => {
  it("POSTs the payload and revalidates the linked contact and the dashboard", async () => {
    apiFetchMock.mockResolvedValue({ id: "a1" });

    expect(await createActivity(form)).toEqual({ ok: true, data: { id: "a1" } });
    expect(apiFetchMock).toHaveBeenCalledWith("/activities", {
      method: "POST",
      body: {
        type: "call",
        subject: "Intro call",
        body: null,
        occurred_at: null,
        contact_id: "c1",
        deal_id: null,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/contacts/c1");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledTimes(2);
  });

  it("revalidates the linked deal", async () => {
    apiFetchMock.mockResolvedValue({ id: "a1" });

    await createActivity({ ...emptyActivityForm({ dealId: "d1" }), subject: "Demo" });

    expect(revalidatePath).toHaveBeenCalledWith("/deals/d1");
  });

  it("validates the input", async () => {
    expect(await createActivity({ ...form, subject: "" })).toEqual({
      ok: false,
      error: "Subject is required",
      status: 422,
    });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(422, "contact_id: not found"));

    expect((await createActivity(form)).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteActivity", () => {
  it("DELETEs the activity and revalidates the linked pages", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    expect((await deleteActivity("a1", { contactId: "c1", dealId: "d1" })).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/activities/a1", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/contacts/c1");
    expect(revalidatePath).toHaveBeenCalledWith("/deals/d1");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Activity not found"));

    expect((await deleteActivity("a1", {})).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
