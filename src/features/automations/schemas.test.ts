import { describe, expect, it } from "vitest";
import { emptyWebhookForm, webhookFormSchema } from "./schemas";

describe("webhookFormSchema", () => {
  const valid = {
    event: "contact.created",
    target_url: "http://localhost:5678/webhook/new-contact",
    is_active: true,
  };

  it("accepts a valid subscription", () => {
    expect(webhookFormSchema.safeParse(valid).success).toBe(true);
  });

  it("requires an event", () => {
    const result = webhookFormSchema.safeParse({ ...valid, event: "" });
    expect(result.error?.issues[0]?.message).toBe("Pick an event");
  });

  it.each(["", "localhost:5678/webhook", "ftp://example.com", "javascript:alert(1)"])(
    "rejects the target URL %j",
    (target_url) => {
      const result = webhookFormSchema.safeParse({ ...valid, target_url });
      expect(result.error?.issues[0]?.message).toMatch(/^Enter a full URL/);
    },
  );

  it("accepts http and https URLs", () => {
    for (const target_url of ["http://localhost:5678/webhook/x", "https://n8n.example.com/x"]) {
      expect(webhookFormSchema.safeParse({ ...valid, target_url }).success).toBe(true);
    }
  });

  it("starts empty and active", () => {
    expect(emptyWebhookForm).toEqual({ event: "", target_url: "", is_active: true });
  });
});
