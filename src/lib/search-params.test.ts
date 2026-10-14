import { describe, expect, it } from "vitest";
import { DEFAULT_PAGE_SIZE } from "./constants";
import { getListParams, getParam } from "./search-params";

describe("getParam", () => {
  it("returns a string value", () => {
    expect(getParam({ status: "lead" }, "status")).toBe("lead");
  });

  it("returns the first value of a repeated param", () => {
    expect(getParam({ status: ["lead", "customer"] }, "status")).toBe("lead");
  });

  it("returns undefined for missing or empty values", () => {
    expect(getParam({}, "status")).toBeUndefined();
    expect(getParam({ status: "" }, "status")).toBeUndefined();
    expect(getParam({ status: [] }, "status")).toBeUndefined();
  });
});

describe("getListParams", () => {
  it("uses defaults when nothing is set", () => {
    expect(getListParams({})).toEqual({ page: 1, size: DEFAULT_PAGE_SIZE, search: undefined });
  });

  it("reads page, size and search", () => {
    expect(getListParams({ page: "3", size: "50", search: "acme" })).toEqual({
      page: 3,
      size: 50,
      search: "acme",
    });
  });

  it("falls back to page 1 for invalid or negative pages", () => {
    expect(getListParams({ page: "abc" }).page).toBe(1);
    expect(getListParams({ page: "-2" }).page).toBe(1);
    expect(getListParams({ page: "0" }).page).toBe(1);
  });

  it("falls back to the default size for an invalid size", () => {
    expect(getListParams({ size: "lots" }).size).toBe(DEFAULT_PAGE_SIZE);
  });
});
