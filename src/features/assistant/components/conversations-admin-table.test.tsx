import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithUser } from "@/test/render";
import type { Conversation } from "../types";
import { ConversationsAdminTable } from "./conversations-admin-table";

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
  it("shows every admin's chats with their owner", () => {
    renderWithUser(<ConversationsAdminTable conversations={chats} archived={false} />);

    const row = screen.getByRole("row", { name: /Lead review/ });
    expect(within(row).getByText("Sarah Chen")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "View Lead review" })).toHaveAttribute(
      "href",
      "/assistant/c2",
    );
  });

  it("offers no archive or delete actions", () => {
    renderWithUser(<ConversationsAdminTable conversations={chats} archived={false} />);

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /archive|delete/i })).not.toBeInTheDocument();
  });

  it("has an empty state", () => {
    renderWithUser(<ConversationsAdminTable conversations={[]} archived />);

    expect(screen.getByText("No archived chats")).toBeInTheDocument();
  });
});
