import { describe, expect, it } from "vitest";
import {
  type ActivityFormValues,
  activityFormSchema,
  emptyActivityForm,
  toActivityPayload,
} from "./schemas";

const validForm: ActivityFormValues = {
  ...emptyActivityForm({ contactId: "c1" }),
  subject: "Intro call",
};

describe("activityFormSchema", () => {
  it("accepts a valid form", () => {
    expect(activityFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("requires a subject", () => {
    const result = activityFormSchema.safeParse({ ...validForm, subject: " " });
    expect(result.error?.issues[0]?.message).toBe("Subject is required");
  });

  it("rejects an unknown type", () => {
    const values = { ...validForm, type: "sms" } as unknown as ActivityFormValues;
    expect(activityFormSchema.safeParse(values).success).toBe(false);
  });
});

describe("emptyActivityForm", () => {
  it("starts as a note linked to the given contact or deal", () => {
    expect(emptyActivityForm({ dealId: "d1" })).toEqual({
      type: "note",
      subject: "",
      body: "",
      occurred_at: "",
      contact_id: "",
      deal_id: "d1",
    });
  });
});

describe("toActivityPayload", () => {
  it("sends null for an empty date so the API uses 'now'", () => {
    expect(toActivityPayload(validForm)).toEqual({
      type: "note",
      subject: "Intro call",
      body: null,
      occurred_at: null,
      contact_id: "c1",
      deal_id: null,
    });
  });

  it("converts a date-only value to an ISO datetime (midnight UTC)", () => {
    const payload = toActivityPayload({ ...validForm, occurred_at: "2026-03-05" });
    expect(payload.occurred_at).toBe("2026-03-05T00:00:00.000Z");
  });
});
