import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { router, setUrl } from "@/test/next-mocks";
import { useSearchParamUpdater } from "./use-search-param-updater";

function renderUpdater(url: string) {
  setUrl(url);
  return renderHook(() => useSearchParamUpdater()).result;
}

describe("useSearchParamUpdater", () => {
  it("sets a param and keeps the others", () => {
    const result = renderUpdater("/contacts?status=lead");

    act(() => result.current.setParams({ search: "jane" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts?status=lead&search=jane", {
      scroll: false,
    });
  });

  it("removes a param set to undefined or ''", () => {
    const result = renderUpdater("/contacts?status=lead&search=jane");

    act(() => result.current.setParams({ status: undefined, search: "" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts", { scroll: false });
  });

  it("resets to page 1 when a filter changes", () => {
    const result = renderUpdater("/contacts?page=3&status=lead");

    act(() => result.current.setParams({ status: "customer" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts?status=customer", { scroll: false });
  });

  it("keeps the page when the page itself is updated", () => {
    const result = renderUpdater("/contacts?status=lead");

    act(() => result.current.setParams({ page: "2" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts?status=lead&page=2", {
      scroll: false,
    });
  });

  it("exposes the current search params", () => {
    const result = renderUpdater("/tasks?overdue=true");

    expect(result.current.searchParams.get("overdue")).toBe("true");
    expect(result.current.isPending).toBe(false);
  });
});
