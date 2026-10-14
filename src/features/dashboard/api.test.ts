import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { getDashboardSummary } from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

describe("getDashboardSummary", () => {
  it("fetches /dashboard/summary", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ overdue_tasks: 2 });

    expect(await getDashboardSummary()).toEqual({ overdue_tasks: 2 });
    expect(apiFetch).toHaveBeenCalledWith("/dashboard/summary");
  });
});
