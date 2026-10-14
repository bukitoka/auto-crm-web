import { describe, expect, it } from "vitest";
import { emailDraftSchema, extractContactSchema } from "./schemas";

describe("emailDraftSchema", () => {
  const valid = { purpose: "Follow up on the demo", tone: "friendly" as const, deal_id: "" };

  it("accepts a valid request", () => {
    expect(emailDraftSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a purpose of at least 3 characters (after trimming)", () => {
    const result = emailDraftSchema.safeParse({ ...valid, purpose: "  hi  " });
    expect(result.error?.issues[0]?.message).toBe("Describe what the email is for");
  });

  it("rejects an unknown tone", () => {
    expect(emailDraftSchema.safeParse({ ...valid, tone: "angry" }).success).toBe(false);
  });
});

describe("extractContactSchema", () => {
  it("requires at least 10 characters of text", () => {
    const result = extractContactSchema.safeParse({ text: "Jane" });
    expect(result.error?.issues[0]?.message).toBe(
      "Paste a bit more text (signature, card, email…)",
    );
  });

  it("trims the pasted text", () => {
    expect(extractContactSchema.parse({ text: "  Jane Doe, Acme  " }).text).toBe("Jane Doe, Acme");
  });

  it("limits the text to 8000 characters (same as the API)", () => {
    expect(extractContactSchema.safeParse({ text: "x".repeat(8001) }).success).toBe(false);
  });
});
