import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import {
  bulkConversations,
  deleteConversation,
  renameConversation,
  searchConversations,
  sendMessage,
  setConversationArchived,
  startConversation,
} from "./actions";
import type { ChatTurn } from "./types";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

function turn(withActions = false): ChatTurn {
  return {
    conversation: { id: "c1" } as ChatTurn["conversation"],
    messages: [
      { id: "m1", role: "user", content: "Hi", actions: [], created_at: "" },
      {
        id: "m2",
        role: "assistant",
        content: "Done",
        actions: withActions ? [{ kind: "created" } as never] : [],
        created_at: "",
      },
    ],
  };
}

describe("startConversation / sendMessage", () => {
  it("starts a chat with the first message and the page context", async () => {
    apiFetchMock.mockResolvedValue(turn());
    const context = { type: "contact" as const, id: "ct1" };

    const result = await startConversation("  What's overdue?  ", context);

    expect(result.ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/assistant/conversations", {
      method: "POST",
      body: { content: "What's overdue?", context },
    });
    // The sidebar's recent chats live in the root layout.
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("continues a chat and refreshes every page after CRM changes", async () => {
    apiFetchMock.mockResolvedValue(turn(true));

    await sendMessage("c1", "Create a task", null);

    expect(apiFetchMock).toHaveBeenCalledWith("/assistant/conversations/c1/messages", {
      method: "POST",
      body: { content: "Create a task", context: null },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("refuses empty messages without calling the API", async () => {
    expect(await startConversation("   ", null)).toEqual({
      ok: false,
      error: "Type a message first",
      status: 422,
    });
    expect(await sendMessage("c1", "", null)).toMatchObject({ ok: false });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("returns AI errors", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(502, "The AI provider request failed"));

    const result = await sendMessage("c1", "Hi", null);

    expect(result).toEqual({ ok: false, error: "The AI provider request failed", status: 502 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("managing chats", () => {
  it("searches your chats", async () => {
    apiFetchMock.mockResolvedValue({ items: [], total: 0, page: 1, size: 50 });

    await searchConversations({ archived: true, search: "plan" });

    expect(apiFetchMock).toHaveBeenCalledWith("/assistant/conversations", {
      query: { size: 50, archived: true, search: "plan" },
    });
  });

  it("renames (trimmed) and needs a name", async () => {
    apiFetchMock.mockResolvedValue({ id: "c1" });

    await renameConversation("c1", "  Day plan ");

    expect(apiFetchMock).toHaveBeenCalledWith("/assistant/conversations/c1", {
      method: "PATCH",
      body: { title: "Day plan" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(await renameConversation("c1", " ")).toMatchObject({ ok: false, status: 422 });
  });

  it("archives, restores and deletes", async () => {
    apiFetchMock.mockResolvedValue({ id: "c1" });

    await setConversationArchived("c1", true);
    expect(apiFetchMock).toHaveBeenLastCalledWith("/assistant/conversations/c1", {
      method: "PATCH",
      body: { is_archived: true },
    });

    apiFetchMock.mockResolvedValue(undefined);
    await deleteConversation("c1");
    expect(apiFetchMock).toHaveBeenLastCalledWith("/assistant/conversations/c1", {
      method: "DELETE",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("runs bulk actions and needs a selection", async () => {
    apiFetchMock.mockResolvedValue({ affected: 2 });

    const result = await bulkConversations(["a", "b"], "archive");

    expect(result).toEqual({ ok: true, data: { affected: 2 } });
    expect(apiFetchMock).toHaveBeenCalledWith("/assistant/conversations/bulk", {
      method: "POST",
      body: { ids: ["a", "b"], action: "archive" },
    });
    expect(await bulkConversations([], "delete")).toMatchObject({ ok: false, status: 422 });
  });
});
