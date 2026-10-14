import { act, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { deferred } from "@/test/deferred";
import { router } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { sendMessage, startConversation } from "../actions";
import type { ChatMessage, ChatTurn } from "../types";
import { ChatThread } from "./chat-thread";

vi.mock("../actions", () => ({ startConversation: vi.fn(), sendMessage: vi.fn() }));

const contactId = "01a133fe-b59b-7501-8708-5e2e01a850be";

function msg(role: ChatMessage["role"], content: string, extra: Partial<ChatMessage> = {}) {
  return { id: `${role}-${content}`, role, content, actions: [], created_at: "", ...extra };
}

function turn(reply: string, actions: ChatMessage["actions"] = []): ChatTurn {
  return {
    conversation: { id: "c1" } as ChatTurn["conversation"],
    messages: [msg("user", "question"), msg("assistant", reply, { actions })],
  };
}

describe("ChatThread", () => {
  it("shows saved messages and continues the conversation", async () => {
    vi.mocked(sendMessage).mockResolvedValue({ ok: true, data: turn("Sure!") });
    const { user } = renderWithUser(
      <ChatThread
        conversationId="c1"
        initialMessages={[msg("user", "Hi"), msg("assistant", "Hello")]}
      />,
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Message the assistant"), "Next{Enter}");

    expect(sendMessage).toHaveBeenCalledWith("c1", "Next", null);
    expect(await screen.findByText("Sure!")).toBeInTheDocument();
    expect(startConversation).not.toHaveBeenCalled();
  });

  it("starts a conversation from the empty state and reports the new id", async () => {
    vi.mocked(startConversation).mockResolvedValue({ ok: true, data: turn("Hi there") });
    const onTurn = vi.fn();
    const { user } = renderWithUser(
      <ChatThread
        conversationId={null}
        onTurn={onTurn}
        renderEmpty={(composer, send) => (
          <div>
            <button type="button" onClick={() => send("Plan my day")}>
              Idea
            </button>
            {composer}
          </div>
        )}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Idea" }));

    expect(startConversation).toHaveBeenCalledWith("Plan my day", null);
    await waitFor(() => expect(onTurn).toHaveBeenCalled());
    expect(onTurn.mock.calls[0][0].conversation.id).toBe("c1");
  });

  it("links what the assistant changed and refreshes the page", async () => {
    vi.mocked(sendMessage).mockResolvedValue({
      ok: true,
      data: turn("Done", [
        {
          kind: "created",
          entity: "task",
          entity_id: "t1",
          label: "Task: Call Jane",
          link_entity: "contact",
          link_id: contactId,
        },
      ]),
    });
    const { user } = renderWithUser(<ChatThread conversationId="c1" />);

    await user.type(screen.getByLabelText("Message the assistant"), "Do it{Enter}");

    const link = await screen.findByRole("link", { name: /Task: Call Jane/ });
    expect(link).toHaveAttribute("href", `/contacts/${contactId}`);
    expect(router.refresh).toHaveBeenCalled();
  });

  it("shows a working state, and Shift+Enter adds a new line", async () => {
    const request = deferred<ActionResult<ChatTurn>>();
    vi.mocked(sendMessage).mockReturnValue(request.promise);
    const { user } = renderWithUser(<ChatThread conversationId="c1" />);
    const input = screen.getByLabelText("Message the assistant");

    await user.type(input, "Line one{Shift>}{Enter}{/Shift}line two");
    expect(input).toHaveValue("Line one\nline two");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByText("Working on it…")).toBeInTheDocument();
    expect(screen.getByText(/Line one/)).toBeInTheDocument(); // shown right away
    await act(async () => request.resolve({ ok: true, data: turn("ok") }));
    expect(screen.queryByText("Working on it…")).not.toBeInTheDocument();
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it("takes the message back when sending fails", async () => {
    vi.mocked(sendMessage).mockResolvedValue({
      ok: false,
      error: "The AI provider request failed",
      status: 502,
    });
    const { user } = renderWithUser(<ChatThread conversationId="c1" />);

    await user.type(screen.getByLabelText("Message the assistant"), "Hello{Enter}");

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("The AI provider request failed"));
    expect(screen.getByLabelText("Message the assistant")).toHaveValue("Hello");
  });

  it("passes the page context and shows it", async () => {
    vi.mocked(sendMessage).mockResolvedValue({ ok: true, data: turn("ok") });
    const { user } = renderWithUser(
      <ChatThread
        conversationId="c1"
        context={{ type: "contact", id: contactId }}
        variant="panel"
      />,
    );

    expect(screen.getByText("Using this contact")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Message the assistant"), "Hi{Enter}");

    expect(sendMessage).toHaveBeenCalledWith("c1", "Hi", { type: "contact", id: contactId });
  });

  it("is read-only for admins viewing someone else's chat", () => {
    renderWithUser(
      <ChatThread conversationId="c1" readOnly initialMessages={[msg("user", "Their question")]} />,
    );

    expect(screen.getByText("Their question")).toBeInTheDocument();
    expect(screen.queryByLabelText("Message the assistant")).not.toBeInTheDocument();
  });
});
