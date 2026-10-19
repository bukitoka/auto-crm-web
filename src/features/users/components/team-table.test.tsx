import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { User } from "../types";
import { TeamTable } from "./team-table";

vi.mock("../actions", () => ({ createAdmin: vi.fn(), updateAdmin: vi.fn(), updateUser: vi.fn() }));

const ada: User = {
  id: "u1",
  email: "ada@example.com",
  full_name: "Ada Admin",
  role: "admin",
  is_active: true,
  is_super_admin: false,
  avatar_url: null,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
};

describe("TeamTable", () => {
  it("explains the empty state and offers to create the first admin", () => {
    render(<TeamTable users={[]} />);

    expect(screen.getByText("No admins yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New admin" })).toBeInTheDocument();
  });

  it("lists each admin with an edit button", () => {
    render(<TeamTable users={[ada]} />);

    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Ada Admin" })).toBeInTheDocument();
  });
});
