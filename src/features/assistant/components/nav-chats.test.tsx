import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import type { Conversation } from "../types";
import { NavChats } from "./nav-chats";

vi.mock("../actions", () => ({
  deleteConversation: vi.fn(),
  renameConversation: vi.fn(),
  setConversationArchived: vi.fn(),
}));

const chat = {
  id: "c1",
  title: "Plan my day",
  is_archived: false,
  message_count: 2,
  last_message_at: new Date().toISOString(),
  user_id: "u1",
  user: { id: "u1", full_name: "Alex" },
  created_at: "",
  updated_at: "",
} satisfies Conversation;

beforeAll(() => {
  // SidebarProvider's mobile check uses matchMedia, which jsdom doesn't implement.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

function renderNav(conversations: Conversation[]) {
  return renderWithUser(
    <SidebarProvider>
      <NavChats conversations={conversations} />
    </SidebarProvider>,
  );
}

describe("NavChats", () => {
  it("lists recent chats, marks the open one and links to all chats", () => {
    setUrl("/assistant/c1");
    renderNav([chat]);

    const link = screen.getByRole("link", { name: "Plan my day" });
    expect(link).toHaveAttribute("href", "/assistant/c1");
    expect(link).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("link", { name: "All chats" })).toHaveAttribute(
      "href",
      "/assistant/history",
    );
    expect(screen.getByRole("link", { name: "New chat" })).toHaveAttribute("href", "/assistant");
  });

  it("opens the chat menu", async () => {
    const { user } = renderNav([chat]);

    await user.click(screen.getByRole("button", { name: "Options for Plan my day" }));

    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Archive" })).toBeInTheDocument();
  });

  it("explains itself when there are no chats yet", () => {
    renderNav([]);

    expect(screen.getByText("Your chats with the assistant show up here.")).toBeInTheDocument();
  });
});
