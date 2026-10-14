import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { sendEmail } from "./actions";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe("sendEmail", () => {
  it("POSTs the email and refreshes the contact (and deal) page", async () => {
    apiFetchMock.mockResolvedValue({ id: "activity-1" });

    const result = await sendEmail("contact-1", {
      subject: " Hello ",
      body: "Hi Jane",
      deal_id: "deal-1",
    });

    expect(result.ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/emails", {
      method: "POST",
      body: { contact_id: "contact-1", subject: "Hello", body: "Hi Jane", deal_id: "deal-1" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/contacts/contact-1");
    expect(revalidatePath).toHaveBeenCalledWith("/deals/deal-1");
  });

  it("sends deal_id null when no deal is picked", async () => {
    apiFetchMock.mockResolvedValue({ id: "activity-1" });

    await sendEmail("contact-1", { subject: "Hi", body: "Hi", deal_id: "" });

    expect(apiFetchMock.mock.calls[0][1]?.body).toMatchObject({ deal_id: null });
    expect(revalidatePath).toHaveBeenCalledTimes(1);
  });

  it("validates before calling the API", async () => {
    const result = await sendEmail("contact-1", { subject: " ", body: "Hi", deal_id: "" });

    expect(result).toEqual({ ok: false, error: "Subject is required", status: 422 });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("returns delivery errors from the API", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(502, "The email could not be sent."));

    const result = await sendEmail("contact-1", { subject: "Hi", body: "Hi", deal_id: "" });

    expect(result).toEqual({ ok: false, error: "The email could not be sent.", status: 502 });
  });
});
