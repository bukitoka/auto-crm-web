import { act, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { deferred } from "@/test/deferred";
import { renderWithUser } from "@/test/render";
import { login } from "../actions";
import { LoginForm } from "./login-form";

vi.mock("../actions", () => ({ login: vi.fn() }));

describe("LoginForm", () => {
  it("tells the user when their session expired", () => {
    renderWithUser(<LoginForm expired />);

    expect(screen.getByText("Your session expired. Please log in again.")).toBeInTheDocument();
  });

  it("confirms a password reset and links to it", () => {
    renderWithUser(<LoginForm reset />);

    expect(screen.getByText(/Your password was changed/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("validates before calling the action", async () => {
    const { user } = renderWithUser(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("logs in and passes the page the user came from", async () => {
    const request = deferred<ActionResult>();
    vi.mocked(login).mockReturnValue(request.promise);
    const { user } = renderWithUser(<LoginForm from="/deals" />);

    await user.type(screen.getByLabelText("Email"), "jane@acme.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(login).toHaveBeenCalledWith({ email: "jane@acme.com", password: "secret123" }, "/deals");
    await waitFor(() => expect(screen.getByRole("button", { name: /Log in/ })).toBeDisabled());

    await act(async () => request.resolve({ ok: false, error: "Server error" }));
    expect(screen.getByRole("button", { name: /Log in/ })).toBeEnabled();
  });

  it("shows the error for wrong credentials", async () => {
    vi.mocked(login).mockResolvedValue({
      ok: false,
      error: "Invalid email or password",
      status: 401,
    });
    const { user } = renderWithUser(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "jane@acme.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Invalid email or password"));
  });
});
