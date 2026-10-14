import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { requestPasswordReset } from "../actions";
import { ForgotPasswordForm } from "./forgot-password-form";

vi.mock("../actions", () => ({ requestPasswordReset: vi.fn() }));

describe("ForgotPasswordForm", () => {
  it("validates the email before calling the action", async () => {
    const { user } = renderWithUser(<ForgotPasswordForm />);

    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it("confirms the link is on its way", async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({ ok: true, data: undefined });
    const { user } = renderWithUser(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "jane@acme.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(requestPasswordReset).toHaveBeenCalledWith({ email: "jane@acme.com" });
    expect(await screen.findByText("Check your inbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send again" })).toBeInTheDocument();
  });
});
