import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { sendEmail } from "../actions";
import { SendEmailDialog } from "./send-email-dialog";

vi.mock("../actions", () => ({ sendEmail: vi.fn() }));

const props = {
  contactId: "contact-1",
  contactName: "Jane Doe",
  contactEmail: "jane@acme.com",
  deals: [],
};

describe("SendEmailDialog", () => {
  it("is disabled when the contact has no email address", () => {
    renderWithUser(<SendEmailDialog {...props} contactEmail={null} />);

    expect(screen.getByRole("button", { name: "Send email" })).toBeDisabled();
  });

  it("validates, sends, confirms and closes", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ ok: true, data: {} as never });
    const { user } = renderWithUser(<SendEmailDialog {...props} />);

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

  it("keeps the dialog open when sending fails", async () => {
    vi.mocked(sendEmail).mockResolvedValue({
      ok: false,
      error: "The email could not be sent.",
      status: 502,
    });
    const { user } = renderWithUser(<SendEmailDialog {...props} />);

    await user.click(screen.getByRole("button", { name: "Send email" }));
    await user.type(screen.getByLabelText("Subject"), "Hi");
    await user.type(screen.getByLabelText("Message"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(toast.error).toHaveBeenCalledWith("The email could not be sent.");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
