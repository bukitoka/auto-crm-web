import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { resetPassword } from "../actions";
import { ResetPasswordForm } from "./reset-password-form";

vi.mock("../actions", () => ({ resetPassword: vi.fn() }));

describe("ResetPasswordForm", () => {
  it("requires matching passwords", async () => {
    const { user } = renderWithUser(<ResetPasswordForm token="token-1" />);

    await user.type(screen.getByLabelText("New password"), "new-password");
    await user.type(screen.getByLabelText("Confirm new password"), "different");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("sends the token with the new password", async () => {
    vi.mocked(resetPassword).mockResolvedValue({
      ok: false,
      error: "This reset link is invalid or has expired",
      status: 400,
    });
    const { user } = renderWithUser(<ResetPasswordForm token="token-1" />);

    await user.type(screen.getByLabelText("New password"), "new-password");
    await user.type(screen.getByLabelText("Confirm new password"), "new-password");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(resetPassword).toHaveBeenCalledWith("token-1", {
      password: "new-password",
      confirm_password: "new-password",
    });
  });
});
