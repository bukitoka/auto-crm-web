import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUser } from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

describe("getCurrentUser", () => {
  it("fetches /auth/me", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: "u1" });

    expect(await getCurrentUser()).toEqual({ id: "u1" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/me");
  });
});
