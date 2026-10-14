import { describe, expect, it } from "vitest";
import { makeContact } from "@/test/factories";
import {
  type ContactFormValues,
  contactFormSchema,
  contactToForm,
  emptyContactForm,
  toContactPayload,
} from "./schemas";

const validForm: ContactFormValues = { ...emptyContactForm, first_name: "Jane" };

/** First error message for a form, or undefined when valid. */
function firstError(values: ContactFormValues) {
  return contactFormSchema.safeParse(values).error?.issues[0]?.message;
}

describe("contactFormSchema", () => {
  it("accepts a form with only a first name", () => {
    expect(contactFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("requires a first name (whitespace does not count)", () => {
    expect(firstError({ ...validForm, first_name: "   " })).toBe("First name is required");
  });

  it("trims text fields", () => {
    const parsed = contactFormSchema.parse({ ...validForm, first_name: "  Jane ", phone: " 555 " });

    expect(parsed.first_name).toBe("Jane");
    expect(parsed.phone).toBe("555");
  });

  it("allows an empty email but rejects an invalid one", () => {
    expect(firstError({ ...validForm, email: "" })).toBeUndefined();
    expect(firstError({ ...validForm, email: "jane@acme.com" })).toBeUndefined();
    expect(firstError({ ...validForm, email: "not-an-email" })).toBe("Enter a valid email");
  });

  it("rejects an unknown status", () => {
    const values = { ...validForm, status: "vip" } as unknown as ContactFormValues;
    expect(contactFormSchema.safeParse(values).success).toBe(false);
  });

  it("limits the first name to 100 characters", () => {
    expect(firstError({ ...validForm, first_name: "a".repeat(101) })).toBeDefined();
  });
});

describe("toContactPayload", () => {
  it("turns empty strings into null and tags into a trimmed array", () => {
    const payload = toContactPayload({
      ...validForm,
      email: "jane@acme.com",
      tags: " vip, newsletter ,, ",
    });

    expect(payload).toEqual({
      first_name: "Jane",
      last_name: null,
      email: "jane@acme.com",
      phone: null,
      job_title: null,
      status: "lead",
      source: "manual",
      tags: ["vip", "newsletter"],
      company_id: null,
      owner_id: null,
    });
  });

  it("defaults an empty source to 'manual'", () => {
    expect(toContactPayload({ ...validForm, source: "" }).source).toBe("manual");
  });
});

describe("contactToForm", () => {
  it("maps API nulls to empty strings and tags to a comma list", () => {
    const contact = makeContact({
      last_name: null,
      email: null,
      tags: ["vip", "newsletter"],
      company_id: "company-1",
      source: "web_form",
    });

    expect(contactToForm(contact)).toEqual({
      first_name: "Jane",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      status: "lead",
      source: "web_form",
      tags: "vip, newsletter",
      company_id: "company-1",
      owner_id: "",
    });
  });

  it("round-trips back to an equivalent payload", () => {
    const contact = makeContact({ tags: ["vip"], phone: "555" });
    const payload = toContactPayload(contactFormSchema.parse(contactToForm(contact)));

    expect(payload).toMatchObject({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: "555",
      tags: ["vip"],
    });
  });
});
