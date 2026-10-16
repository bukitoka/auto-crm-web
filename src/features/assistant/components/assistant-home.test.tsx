import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { router } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { startConversation } from "../actions";
import type { ChatTurn } from "../types";
import { AssistantHome } from "./assistant-home";

vi.mock("../actions", () => ({ startConversation: vi.fn(), sendMessage: vi.fn() }));

const snapshot = { overdueTasks: 3, openPipeline: "$755.5K", newLeads: 5 };
const turn = {
  conversation: { id: "c9" },
  messages: [],
} as unknown as ChatTurn;

describe("AssistantHome", () => {
  it("greets the user and asks what they will do today", () => {
    renderWithUser(<AssistantHome firstName="Alex" snapshot={snapshot} />);

    expect(screen.getByText(/, Alex$/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What are you going to do today?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3 overdue tasks/ })).toBeInTheDocument();
  });

  it("starts a chat from an idea and opens it", async () => {
    vi.mocked(startConversation).mockResolvedValue({ ok: true, data: turn });
    const { user } = renderWithUser(<AssistantHome firstName="Alex" snapshot={null} />);

    await user.click(screen.getByRole("button", { name: /Plan my day/ }));

    expect(startConversation).toHaveBeenCalledWith(
      "What should I focus on today? Check my overdue and upcoming tasks.",
      null,
      undefined, // no attached files
    );
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/assistant/c9"));
  });

  it("fills the box for ideas that need a name", async () => {
    const { user } = renderWithUser(<AssistantHome firstName="Alex" snapshot={null} />);

    await user.click(screen.getByRole("button", { name: /Log a call/ }));

    expect(screen.getByLabelText("Message the assistant")).toHaveValue("Log a call with ");
    expect(startConversation).not.toHaveBeenCalled();
  });

  it("turns a snapshot number into a question", async () => {
    vi.mocked(startConversation).mockResolvedValue({ ok: true, data: turn });
    const { user } = renderWithUser(<AssistantHome firstName="Alex" snapshot={snapshot} />);

    await user.click(screen.getByRole("button", { name: /open pipeline/ }));

    expect(startConversation).toHaveBeenCalledWith(
      "Summarize my open pipeline by stage.",
      null,
      undefined,
    );
  });
});
