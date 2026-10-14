import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import { makePage } from "@/test/factories";
import { listUserOptions } from "./api";
import type { User } from "./types";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

function makeUser(overrides: Partial<User>): User {
  return {
    id: "u1",
    email: "jane@acme.com",
    full_name: "Jane Doe",
    role: "member",
    is_active: true,
    avatar_url: null,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

describe("listUserOptions", () => {
  it("returns only active users", async () => {
    const active = makeUser({ id: "u1" });
    vi.mocked(apiFetch).mockResolvedValue(
      makePage([active, makeUser({ id: "u2", is_active: false })]),
    );

    expect(await listUserOptions()).toEqual([active]);
    expect(apiFetch).toHaveBeenCalledWith("/users", { query: { size: PICKER_PAGE_SIZE } });
  });
});
