import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { AI_UNAVAILABLE_MESSAGE } from "@/lib/action-result";
import { ApiError, apiFetch } from "@/lib/api-client";
import {
  draftEmail,
  extractContact,
  extractContactFromFile,
  scoreContact,
  summarizeTimeline,
} from "./actions";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe("scoreContact", () => {
  it("POSTs to the score endpoint and revalidates the contact pages", async () => {
    apiFetchMock.mockResolvedValue({ score: 72, reasoning: "Engaged" });

    expect(await scoreContact("c1")).toEqual({
      ok: true,
      data: { score: 72, reasoning: "Engaged" },
    });
    expect(apiFetchMock).toHaveBeenCalledWith("/ai/contacts/c1/score", { method: "POST" });
    expect(revalidatePath).toHaveBeenCalledWith("/contacts/c1");
    expect(revalidatePath).toHaveBeenCalledWith("/contacts");
  });

  it("returns the friendly message when AI is not configured (503)", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(503, "AI provider not configured"));

    expect(await scoreContact("c1")).toEqual({
      ok: false,
      error: AI_UNAVAILABLE_MESSAGE,
      status: 503,
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("draftEmail", () => {
  it("sends the contact, purpose and tone; an empty deal becomes null", async () => {
    apiFetchMock.mockResolvedValue({ subject: "Hi", body: "Hello" });

    const result = await draftEmail("c1", {
      purpose: "  Follow up on the demo ",
      tone: "friendly",
      deal_id: "",
    });

    expect(result).toEqual({ ok: true, data: { subject: "Hi", body: "Hello" } });
    expect(apiFetchMock).toHaveBeenCalledWith("/ai/email-draft", {
      method: "POST",
      body: { contact_id: "c1", deal_id: null, purpose: "Follow up on the demo", tone: "friendly" },
    });
  });

  it("passes the selected deal", async () => {
    apiFetchMock.mockResolvedValue({ subject: "Hi", body: "Hello" });

    await draftEmail("c1", { purpose: "Proposal", tone: "formal", deal_id: "d1" });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/ai/email-draft",
      expect.objectContaining({ body: expect.objectContaining({ deal_id: "d1" }) }),
    );
  });

  it("validates the input", async () => {
    expect(await draftEmail("c1", { purpose: "", tone: "friendly", deal_id: "" })).toEqual({
      ok: false,
      error: "Describe what the email is for",
      status: 422,
    });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe("summarizeTimeline", () => {
  it("summarizes a contact timeline", async () => {
    apiFetchMock.mockResolvedValue({ summary: "Going well", next_actions: [] });

    expect((await summarizeTimeline({ contactId: "c1" })).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/ai/summarize", {
      method: "POST",
      body: { contact_id: "c1", deal_id: null },
    });
  });

  it("summarizes a deal timeline", async () => {
    apiFetchMock.mockResolvedValue({ summary: "Going well", next_actions: [] });

    await summarizeTimeline({ dealId: "d1" });

    expect(apiFetchMock).toHaveBeenCalledWith("/ai/summarize", {
      method: "POST",
      body: { contact_id: null, deal_id: "d1" },
    });
  });
});

describe("extractContact", () => {
  it("POSTs the trimmed text", async () => {
    apiFetchMock.mockResolvedValue({ first_name: "Jane" });

    expect(await extractContact({ text: "  Jane Doe, Acme Inc  " })).toEqual({
      ok: true,
      data: { first_name: "Jane" },
    });
    expect(apiFetchMock).toHaveBeenCalledWith("/ai/extract-contact", {
      method: "POST",
      body: { text: "Jane Doe, Acme Inc" },
    });
  });

  it("validates the input", async () => {
    expect((await extractContact({ text: "short" })).ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe("extractContactFromFile", () => {
  it("uploads the file as multipart to the capture endpoint", async () => {
    apiFetchMock.mockResolvedValue({ first_name: "Dana", source_text: "Dana" });
    const formData = new FormData();
    formData.set("file", new File(["png"], "card.png", { type: "image/png" }));

    const result = await extractContactFromFile(formData);

    expect(result.ok).toBe(true);
    const [path, options] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/ai/extract-contact/file");
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeInstanceOf(FormData);
  });

  it("rejects a missing file without calling the API", async () => {
    const result = await extractContactFromFile(new FormData());

    expect(result).toEqual({ ok: false, error: "Choose a file to upload", status: 422 });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});
