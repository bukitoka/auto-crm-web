import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { makePage } from "@/test/factories";
import { listActivities } from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);

describe("listActivities", () => {
  it("loads the first 50 activities for a contact by default", async () => {
    apiFetchMock.mockResolvedValue(makePage([]));

    await listActivities({ contact_id: "c1" });

    expect(apiFetchMock).toHaveBeenCalledWith("/activities", {
      query: { page: 1, size: 50, contact_id: "c1" },
    });
  });

  it("lets the caller override paging and filter by deal and type", async () => {
    apiFetchMock.mockResolvedValue(makePage([]));

    await listActivities({ deal_id: "d1", type: "call", page: 2, size: 10 });

    expect(apiFetchMock).toHaveBeenCalledWith("/activities", {
      query: { page: 2, size: 10, deal_id: "d1", type: "call" },
    });
  });
});
