import { describe, expect, it } from "vitest";
import { makeCompany } from "@/test/factories";
import {
  type CompanyFormValues,
  companyFormSchema,
  companyToForm,
  emptyCompanyForm,
  toCompanyPayload,
} from "./schemas";

const validForm: CompanyFormValues = { ...emptyCompanyForm, name: "Acme Inc" };

describe("companyFormSchema", () => {
  it("accepts a form with only a name", () => {
    expect(companyFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("requires a name", () => {
    const result = companyFormSchema.safeParse({ ...validForm, name: " " });
    expect(result.error?.issues[0]?.message).toBe("Name is required");
  });

  it("trims text fields", () => {
    expect(companyFormSchema.parse({ ...validForm, domain: " acme.com " }).domain).toBe("acme.com");
  });

  it("limits the industry length", () => {
    expect(companyFormSchema.safeParse({ ...validForm, industry: "x".repeat(101) }).success).toBe(
      false,
    );
  });
});

describe("toCompanyPayload", () => {
  it("turns empty strings into null", () => {
    expect(toCompanyPayload({ ...validForm, size: "11-50" })).toEqual({
      name: "Acme Inc",
      domain: null,
      industry: null,
      size: "11-50",
      website: null,
      notes: null,
      owner_id: null,
    });
  });
});

describe("companyToForm", () => {
  it("maps API nulls to empty strings", () => {
    expect(companyToForm(makeCompany({ industry: "SaaS", owner_id: "u1" }))).toEqual({
      ...emptyCompanyForm,
      name: "Acme Inc",
      industry: "SaaS",
      owner_id: "u1",
    });
  });
});
