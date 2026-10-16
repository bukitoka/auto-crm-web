import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { draftEmail } from "@/features/ai/actions";
import { renderWithUser } from "@/test/render";
import { sendEmail } from "../actions";
import { ComposeEmailDialog } from "./compose-email-dialog";

vi.mock("../actions", () => ({ sendEmail: vi.fn() }));
vi.mock("@/features/ai/actions", () => ({ draftEmail: vi.fn() }));

const jane = { id: "contact-1", name: "Jane Doe", email: "jane@acme.com" };
const props = { recipients: [jane], contactId: jane.id, deals: [] };

describe("ComposeEmailDialog", () => {
  it("validates, sends, confirms and closes", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ ok: true, data: {} as never });
    const { user } = renderWithUser(<ComposeEmailDialog {...props} />);

    await user.click(screen.getByRole("button", { name: "Send email" }));
    expect(screen.getByText(/To jane@acme.com/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Subject is required")).toBeInTheDocument();
    expect(sendEmail).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Subject"), "Quick question");
    await user.type(screen.getByLabelText("Message"), "Hi Jane!");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(sendEmail).toHaveBeenCalledWith("contact-1", {
      subject: "Quick question",
      body: "Hi Jane!",
      deal_id: "",
    });
    expect(toast.success).toHaveBeenCalledWith("Email sent to Jane Doe");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("writes the email with AI, regenerates, and sends the edited result", async () => {
    vi.mocked(draftEmail)
      .mockResolvedValueOnce({ ok: true, data: { subject: "Pilot?", body: "Hi Jane" } })
      .mockResolvedValueOnce({ ok: true, data: { subject: "Next steps", body: "Dear Jane" } });
    vi.mocked(sendEmail).mockResolvedValue({ ok: true, data: {} as never });
    const { user } = renderWithUser(
      <ComposeEmailDialog {...props} deals={[{ id: "deal-1", title: "Pilot" }]} dealId="deal-1" />,
    );

    await user.click(screen.getByRole("button", { name: "Send email" }));
    await user.click(screen.getByRole("button", { name: "Write with AI" }));
    await user.click(screen.getByRole("button", { name: "Write it" }));
    expect(await screen.findByText("Describe what the email is for")).toBeInTheDocument();

    await user.type(screen.getByLabelText("What is the email for?"), "Propose a pilot");
    await user.click(screen.getByRole("button", { name: "Write it" }));

    expect(draftEmail).toHaveBeenCalledWith("contact-1", {
      purpose: "Propose a pilot",
      tone: "friendly",
      deal_id: "deal-1",
    });
    await waitFor(() => expect(screen.getByLabelText("Subject")).toHaveValue("Pilot?"));
    expect(screen.getByLabelText("Message")).toHaveValue("Hi Jane");

    await user.click(await screen.findByRole("button", { name: "Regenerate" }));
    await waitFor(() => expect(screen.getByLabelText("Subject")).toHaveValue("Next steps"));
    await user.type(screen.getByLabelText("Message"), "!");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(sendEmail).toHaveBeenCalledWith("contact-1", {
      subject: "Next steps",
      body: "Dear Jane!",
      deal_id: "deal-1",
    });
  });

  it("picks the recipient on a deal page and needs an address to send", async () => {
    const { user } = renderWithUser(
      <ComposeEmailDialog
        recipients={[jane, { id: "contact-2", name: "Bob Roe", email: null }]}
        deals={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Send email" }));
    await user.type(screen.getByLabelText("Subject"), "Hi");
    await user.type(screen.getByLabelText("Message"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Choose who to email")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "To" }));
    await user.click(screen.getByRole("option", { name: "Bob Roe" }));
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Add an email address to this contact first"),
    ).toBeInTheDocument();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("keeps the dialog open when sending fails", async () => {
    vi.mocked(sendEmail).mockResolvedValue({
      ok: false,
      error: "The email could not be sent.",
      status: 502,
    });
    const { user } = renderWithUser(<ComposeEmailDialog {...props} />);

    await user.click(screen.getByRole("button", { name: "Send email" }));
    await user.type(screen.getByLabelText("Subject"), "Hi");
    await user.type(screen.getByLabelText("Message"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(toast.error).toHaveBeenCalledWith("The email could not be sent.");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
