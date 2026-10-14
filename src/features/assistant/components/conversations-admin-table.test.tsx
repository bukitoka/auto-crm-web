import { screen, waitFor, within } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { bulkConversations } from "../actions";
import type { Conversation } from "../types";
import { ConversationsAdminTable } from "./conversations-admin-table";

vi.mock("../actions", () => ({ bulkConversations: vi.fn() }));

function chat(id: string, title: string, owner: string): Conversation {
  return {
    id,
    title,
    is_archived: false,
    message_count: 4,
    last_message_at: new Date().toISOString(),
    user_id: owner,
    user: { id: owner, full_name: owner === "u1" ? "Alex Admin" : "Sarah Chen" },
    created_at: "",
    updated_at: "",
  };
}

const chats = [chat("c1", "Plan my day", "u1"), chat("c2", "Lead review", "u2")];

describe("ConversationsAdminTable", () => {
  it("shows everyone's chats with their owner", () => {
    renderWithUser(<ConversationsAdminTable conversations={chats} archived={false} />);

    const row = screen.getByRole("row", { name: /Lead review/ });
    expect(within(row).getByText("Sarah Chen")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "View Lead review" })).toHaveAttribute(
      "href",
      "/assistant/c2",
    );
  });

  it("archives the selected chats", async () => {
    vi.mocked(bulkConversations).mockResolvedValue({ ok: true, data: { affected: 2 } });
    const { user } = renderWithUser(
      <ConversationsAdminTable conversations={chats} archived={false} />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Select all" }));
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive" }));

    expect(bulkConversations).toHaveBeenCalledWith(["c1", "c2"], "archive");
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Archived 2 chats"));
  });

  it("restores from the archived view, one row at a time", async () => {
    vi.mocked(bulkConversations).mockResolvedValue({ ok: true, data: { affected: 1 } });
    const { user } = renderWithUser(<ConversationsAdminTable conversations={chats} archived />);

    await user.click(screen.getByRole("button", { name: "Restore Plan my day" }));

    expect(bulkConversations).toHaveBeenCalledWith(["c1"], "unarchive");
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Restored 1 chat"));
  });

  it("deletes only after confirming", async () => {
    vi.mocked(bulkConversations).mockResolvedValue({ ok: true, data: { affected: 1 } });
    const { user } = renderWithUser(
      <ConversationsAdminTable conversations={chats} archived={false} />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Select Lead review" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(bulkConversations).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete" }),
    );

    expect(bulkConversations).toHaveBeenCalledWith(["c2"], "delete");
  });

  it("has an empty state", () => {
    renderWithUser(<ConversationsAdminTable conversations={[]} archived />);

    expect(screen.getByText("No archived chats")).toBeInTheDocument();
  });
});
