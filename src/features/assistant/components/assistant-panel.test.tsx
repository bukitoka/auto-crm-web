import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { sendMessage, startConversation } from "../actions";
import type { ChatTurn } from "../types";
import { AssistantPanel } from "./assistant-panel";

vi.mock("../actions", () => ({ startConversation: vi.fn(), sendMessage: vi.fn() }));

const contactId = "01a133fe-b59b-7501-8708-5e2e01a850be";

function turn(reply: string): ChatTurn {
  return {
    conversation: { id: "c7" } as ChatTurn["conversation"],
    messages: [
      { id: "u", role: "user", content: "q", actions: [], created_at: "" },
      { id: "a", role: "assistant", content: reply, actions: [], created_at: "" },
    ],
  };
}

describe("AssistantPanel", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setUrl(`/contacts/${contactId}`);
  });

  it("offers suggestions for the record you are viewing", async () => {
    vi.mocked(startConversation).mockResolvedValue({ ok: true, data: turn("Here you go") });
    const { user } = renderWithUser(<AssistantPanel />);

    await user.click(screen.getByRole("button", { name: /Ask AI/ }));
    await user.click(
      screen.getByRole("button", { name: "Create a follow-up for this contact tomorrow" }),
    );

    expect(startConversation).toHaveBeenCalledWith("Create a follow-up for this contact tomorrow", {
      type: "contact",
      id: contactId,
    });
    expect(await screen.findByText("Here you go")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open/ })).toHaveAttribute("href", "/assistant/c7");
  });

  it("continues the same saved chat after a reload, and can start a new one", async () => {
    vi.mocked(startConversation).mockResolvedValue({ ok: true, data: turn("First") });
    vi.mocked(sendMessage).mockResolvedValue({ ok: true, data: turn("Second") });
    const first = renderWithUser(<AssistantPanel />);
    await first.user.click(screen.getByRole("button", { name: /Ask AI/ }));
    await first.user.type(screen.getByLabelText("Message the assistant"), "Hi{Enter}");
    await screen.findByText("First");
    first.unmount();

    const { user } = renderWithUser(<AssistantPanel />);
    await user.click(screen.getByRole("button", { name: /Ask AI/ }));
    expect(await screen.findByText("First")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Message the assistant"), "Again{Enter}");
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith("c7", "Again", { type: "contact", id: contactId }),
    );

    await user.click(screen.getByRole("button", { name: /New/ }));
    expect(screen.queryByText("First")).not.toBeInTheDocument();
  });

  it("is hidden on the assistant pages", () => {
    setUrl("/assistant/c1");
    renderWithUser(<AssistantPanel />);

    expect(screen.queryByRole("button", { name: /Ask AI/ })).not.toBeInTheDocument();
  });
});
