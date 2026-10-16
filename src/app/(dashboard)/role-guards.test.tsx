import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { User } from "@/features/auth/types";
import AiChatsPage from "./ai-chats/page";
import AutomationsPage from "./automations/page";
import TeamPage from "./team/page";

const getCurrentUser = vi.hoisted(() => vi.fn());
const listTeam = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/api", () => ({ getCurrentUser }));
vi.mock("@/features/users/api", () => ({ listTeam, listUserOptions: vi.fn() }));
vi.mock("@/features/automations/api", () => ({
  listWebhooks: vi.fn(),
  listWebhookEvents: vi.fn(),
}));
vi.mock("@/features/assistant/api", () => ({ listConversations: vi.fn() }));

const admin = { is_super_admin: false } as User;

describe("super admin pages", () => {
  it.each([
    ["Admins", () => TeamPage()],
    ["Automations", () => AutomationsPage()],
    ["AI chats", () => AiChatsPage({ searchParams: Promise.resolve({}) } as never)],
  ])("%s shows a forbidden state to admins and loads nothing", async (_name, load) => {
    getCurrentUser.mockResolvedValue(admin);

    render(await load());

    expect(screen.getByText("You don't have access to this page")).toBeInTheDocument();
    expect(listTeam).not.toHaveBeenCalled();
  });
});
