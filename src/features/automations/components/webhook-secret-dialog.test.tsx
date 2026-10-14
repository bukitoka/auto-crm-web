import { screen } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { WebhookSecretDialog } from "./webhook-secret-dialog";

describe("WebhookSecretDialog", () => {
  it("is hidden when there is no secret", () => {
    renderWithUser(<WebhookSecretDialog secret={null} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the secret with a one-time warning", () => {
    renderWithUser(<WebhookSecretDialog secret="whsec_123" onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Signing secret" })).toBeInTheDocument();
    expect(screen.getByText("whsec_123")).toBeInTheDocument();
    expect(screen.getByText("For security, this secret is only shown once.")).toBeInTheDocument();
  });

  it("copies the secret to the clipboard", async () => {
    const { user } = renderWithUser(<WebhookSecretDialog secret="whsec_123" onClose={vi.fn()} />);
    // user-event installs a clipboard stub on setup; spy on it after rendering.
    const writeText = vi.spyOn(navigator.clipboard, "writeText");

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith("whsec_123");
    expect(toast.success).toHaveBeenCalledWith("Secret copied");
  });

  it("calls onClose from the Done button", async () => {
    const onClose = vi.fn();
    const { user } = renderWithUser(<WebhookSecretDialog secret="whsec_123" onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onClose).toHaveBeenCalled();
  });
});
