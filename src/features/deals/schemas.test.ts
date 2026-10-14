import { describe, expect, it } from "vitest";
import { makeDeal } from "@/test/factories";
import {
  type DealFormValues,
  dealFormSchema,
  dealToForm,
  emptyDealForm,
  toDealPayload,
} from "./schemas";

const validForm: DealFormValues = {
  ...emptyDealForm("stage-1"),
  title: "Website redesign",
  value: "5000",
};

function errorFor(values: DealFormValues, field: keyof DealFormValues) {
  const issues = dealFormSchema.safeParse(values).error?.issues ?? [];
  return issues.find((issue) => issue.path[0] === field)?.message;
}

describe("dealFormSchema", () => {
  it("accepts a valid form", () => {
    expect(dealFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("requires a title and a stage", () => {
    const values = { ...validForm, title: "", stage_id: "" };
    expect(errorFor(values, "title")).toBe("Title is required");
    expect(errorFor(values, "stage_id")).toBe("Pick a stage");
  });

  it.each(["", "abc", "-1", "Infinity"])("rejects the amount %j", (value) => {
    expect(errorFor({ ...validForm, value }, "value")).toBe("Enter an amount");
  });

  it.each(["0", "1500.50", " 42 "])("accepts the amount %j", (value) => {
    expect(errorFor({ ...validForm, value }, "value")).toBeUndefined();
  });

  it("uppercases the currency and requires 3 letters", () => {
    expect(dealFormSchema.parse({ ...validForm, currency: " eur " }).currency).toBe("EUR");
    expect(errorFor({ ...validForm, currency: "EU" }, "currency")).toBe(
      "Use a 3-letter code, e.g. USD",
    );
  });

  it("defaults new deals to USD and the given stage", () => {
    expect(emptyDealForm("stage-2")).toMatchObject({ currency: "USD", stage_id: "stage-2" });
    expect(emptyDealForm().stage_id).toBe("");
  });
});

describe("toDealPayload", () => {
  it("converts the value to a number and empty strings to null", () => {
    expect(toDealPayload(dealFormSchema.parse({ ...validForm, value: "1500.50" }))).toEqual({
      title: "Website redesign",
      value: 1500.5,
      currency: "USD",
      stage_id: "stage-1",
      contact_id: null,
      company_id: null,
      owner_id: null,
      expected_close_date: null,
    });
  });
});

describe("dealToForm", () => {
  it("normalizes the decimal string and the close date", () => {
    const deal = makeDeal({
      value: "5000.00",
      expected_close_date: "2026-06-30T00:00:00Z",
      contact_id: "contact-1",
    });

    expect(dealToForm(deal)).toEqual({
      title: "Website redesign",
      value: "5000",
      currency: "USD",
      stage_id: "stage-1",
      contact_id: "contact-1",
      company_id: "",
      owner_id: "",
      expected_close_date: "2026-06-30",
    });
  });
});
