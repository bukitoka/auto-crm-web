import { describe, expect, it } from "vitest";
import { DEFAULT_PAGE_SIZE } from "./constants";
import { getListParams, getParam, getSortParams, nextSort } from "./search-params";

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

describe("getSortParams", () => {
  it("is empty when no sort is set", () => {
    expect(getSortParams({ order: "desc" })).toEqual({});
  });

  it("defaults the order to ascending", () => {
    expect(getSortParams({ sort: "name" })).toEqual({ sort: "name", order: "asc" });
    expect(getSortParams({ sort: "name", order: "sideways" })).toEqual({
      sort: "name",
      order: "asc",
    });
    expect(getSortParams({ sort: "name", order: "desc" })).toEqual({
      sort: "name",
      order: "desc",
    });
  });
});

describe("nextSort", () => {
  it("cycles ascending, descending, off", () => {
    expect(nextSort({}, "name")).toEqual({ sort: "name", order: "asc" });
    expect(nextSort({ sort: "name", order: "asc" }, "name")).toEqual({
      sort: "name",
      order: "desc",
    });
    expect(nextSort({ sort: "name", order: "desc" }, "name")).toEqual({
      sort: undefined,
      order: undefined,
    });
  });

  it("starts ascending when switching to another column", () => {
    expect(nextSort({ sort: "name", order: "desc" }, "email")).toEqual({
      sort: "email",
      order: "asc",
    });
  });

  it("cycles descending, ascending, off when the first order is descending", () => {
    expect(nextSort({}, "created_at", "desc")).toEqual({ sort: "created_at", order: "desc" });
    expect(nextSort({ sort: "created_at", order: "desc" }, "created_at", "desc")).toEqual({
      sort: "created_at",
      order: "asc",
    });
    expect(nextSort({ sort: "created_at", order: "asc" }, "created_at", "desc")).toEqual({
      sort: undefined,
      order: undefined,
    });
  });

  it("starts descending when switching to a descending-first column", () => {
    expect(nextSort({ sort: "name", order: "asc" }, "created_at", "desc")).toEqual({
      sort: "created_at",
      order: "desc",
    });
  });
});
