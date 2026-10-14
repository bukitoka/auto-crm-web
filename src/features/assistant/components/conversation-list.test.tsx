import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { router, setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import {
  deleteConversation,
  renameConversation,
  searchConversations,
  setConversationArchived,
} from "../actions";
import type { Conversation } from "../types";
import { ConversationList } from "./conversation-list";

vi.mock("../actions", () => ({
  deleteConversation: vi.fn(),
  renameConversation: vi.fn(),
  searchConversations: vi.fn(),
  setConversationArchived: vi.fn(),
}));

function chat(id: string, title: string, extra: Partial<Conversation> = {}): Conversation {
  return {
    id,
    title,
    is_archived: false,
    message_count: 2,
    last_message_at: new Date().toISOString(),
    user_id: "u1",
    user: { id: "u1", full_name: "Alex" },
    created_at: "",
    updated_at: "",
    ...extra,
  };
}

const chats = [chat("c1", "Plan my day"), chat("c2", "Pipeline check")];

async function openMenu(user: ReturnType<typeof renderWithUser>["user"], title: string) {
  await user.click(screen.getByRole("button", { name: `Options for ${title}` }));
}

describe("ConversationList", () => {
  beforeEach(() => setUrl("/assistant/c1"));

  it("lists chats by date with their message count", () => {
    renderWithUser(<ConversationList conversations={chats} />);

    expect(screen.getByText("Today")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Plan my day/ });
    expect(link).toHaveAttribute("href", "/assistant/c1");
    expect(link).toHaveTextContent("2 messages");
  });

  it("searches and shows archived chats", async () => {
    vi.mocked(searchConversations).mockResolvedValue({
      ok: true,
      data: { items: [chat("c3", "Old chat", { is_archived: true })], total: 1, page: 1, size: 50 },
    });
    const { user } = renderWithUser(<ConversationList conversations={chats} />);

    await user.click(screen.getByRole("tab", { name: "Archived" }));

    expect(await screen.findByText("Old chat")).toBeInTheDocument();
    expect(searchConversations).toHaveBeenCalledWith({ archived: true, search: undefined });
    await user.type(screen.getByLabelText("Search chats"), "old");
    await waitFor(() =>
      expect(searchConversations).toHaveBeenLastCalledWith({ archived: true, search: "old" }),
    );
  });

  it("renames a chat in a dialog", async () => {
    vi.mocked(renameConversation).mockResolvedValue({ ok: true, data: chats[1] });
    const { user } = renderWithUser(<ConversationList conversations={chats} />);

    await openMenu(user, "Pipeline check");
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    const input = screen.getByLabelText("Chat name");
    expect(input).toHaveValue("Pipeline check");
    await user.clear(input);
    await user.type(input, "Q4 pipeline{Enter}");

    expect(renameConversation).toHaveBeenCalledWith("c2", "Q4 pipeline");
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Chat renamed"));
    expect(router.refresh).toHaveBeenCalled();
  });

  it("archives the open chat and goes back to the assistant home", async () => {
    vi.mocked(setConversationArchived).mockResolvedValue({ ok: true, data: chats[0] });
    const { user } = renderWithUser(<ConversationList conversations={chats} />);

    await openMenu(user, "Plan my day");
    await user.click(screen.getByRole("menuitem", { name: "Archive" }));

    await waitFor(() => expect(setConversationArchived).toHaveBeenCalledWith("c1", true));
    expect(toast.success).toHaveBeenCalledWith("Chat archived");
    expect(router.push).toHaveBeenCalledWith("/assistant");
  });

  it("deletes after confirming", async () => {
    vi.mocked(deleteConversation).mockResolvedValue({ ok: true, data: undefined });
    const { user } = renderWithUser(<ConversationList conversations={chats} />);

    await openMenu(user, "Pipeline check");
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(screen.getByText("Delete this chat?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteConversation).toHaveBeenCalledWith("c2"));
    expect(toast.success).toHaveBeenCalledWith("Chat deleted");
    expect(router.push).not.toHaveBeenCalled(); // it wasn't the open chat
  });
});
