import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { SESSION_COOKIE } from "@/lib/constants";
import { cookieStore, setCookie } from "@/test/next-mocks";
import {
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  setUpWorkspace,
} from "./actions";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const credentials = { email: "jane@acme.com", password: "secret123" };
const token = { access_token: "jwt-123", token_type: "bearer" };

describe("login", () => {
  it("logs in without a token, stores the JWT and redirects to the assistant home", async () => {
    apiFetchMock.mockResolvedValue(token);

    // redirect() throws, exactly like in Next.js.
    await expect(login(credentials)).rejects.toThrow("NEXT_REDIRECT");

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: credentials,
      auth: false,
    });
    expect(cookieStore.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      "jwt-123",
      expect.objectContaining({ httpOnly: true }),
    );
    expect(redirect).toHaveBeenCalledWith("/assistant");
  });

  it("redirects back to the page the user came from", async () => {
    apiFetchMock.mockResolvedValue(token);

    await expect(login(credentials, "/contacts?status=lead")).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/contacts?status=lead");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example", // browsers treat "/\" like "//"
    "javascript:alert(1)",
  ])("ignores the unsafe `from` value %s", async (from) => {
    apiFetchMock.mockResolvedValue(token);

    await expect(login(credentials, from)).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/assistant");
  });

  it("returns the API error and keeps the user on the page", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(401, "Invalid email or password"));

    expect(await login(credentials)).toEqual({
      ok: false,
      error: "Invalid email or password",
      status: 401,
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("validates the input", async () => {
    expect(await login({ email: "nope", password: "x" })).toEqual({
      ok: false,
      error: "Enter a valid email",
      status: 422,
    });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe("setUpWorkspace", () => {
  const values = { full_name: "Owner", ...credentials, confirm_password: credentials.password };

  it("creates the super admin, logs in and redirects home", async () => {
    apiFetchMock.mockResolvedValueOnce({ id: "u1" }); // setup
    apiFetchMock.mockResolvedValueOnce(token); // login

    await expect(setUpWorkspace(values)).rejects.toThrow("NEXT_REDIRECT");

    expect(apiFetchMock).toHaveBeenNthCalledWith(1, "/auth/setup", {
      method: "POST",
      body: { full_name: "Owner", ...credentials },
      auth: false,
    });
    expect(redirect).toHaveBeenCalledWith("/assistant");
  });

  it("returns the API error when the workspace is already set up", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(409, "The workspace is already set up"));

    expect(await setUpWorkspace(values)).toEqual({
      ok: false,
      error: "The workspace is already set up",
      status: 409,
    });
  });
});

describe("register", () => {
  const values = {
    full_name: "Jane Doe",
    ...credentials,
    confirm_password: credentials.password,
  };

  it("creates the account, logs in and redirects to the assistant home", async () => {
    apiFetchMock.mockResolvedValueOnce({ id: "u1" }); // register
    apiFetchMock.mockResolvedValueOnce(token); // login

    await expect(register(values)).rejects.toThrow("NEXT_REDIRECT");

    expect(apiFetchMock).toHaveBeenNthCalledWith(1, "/auth/register", {
      method: "POST",
      body: { full_name: "Jane Doe", ...credentials }, // no confirm_password
      auth: false,
    });
    expect(apiFetchMock).toHaveBeenNthCalledWith(2, "/auth/login", {
      method: "POST",
      body: credentials,
      auth: false,
    });
    expect(cookieStore.set).toHaveBeenCalledWith(SESSION_COOKIE, "jwt-123", expect.anything());
    expect(redirect).toHaveBeenCalledWith("/assistant");
  });

  it("returns the API error (e.g. email taken)", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(409, "Email already registered"));

    expect(await register(values)).toEqual({
      ok: false,
      error: "Email already registered",
      status: 409,
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("validates the input", async () => {
    expect(await register({ ...values, confirm_password: "other" })).toMatchObject({
      ok: false,
      error: "Passwords do not match",
    });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("clears the session cookie and redirects to /login", async () => {
    setCookie(SESSION_COOKIE, "jwt-123");

    await expect(logout()).rejects.toThrow("NEXT_REDIRECT");

    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});

describe("requestPasswordReset", () => {
  it("asks the API to email a reset link (no session needed)", async () => {
    apiFetchMock.mockResolvedValue({ detail: "sent" });

    const result = await requestPasswordReset({ email: "jane@acme.com" });

    expect(result.ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/auth/forgot-password", {
      method: "POST",
      body: { email: "jane@acme.com" },
      auth: false,
    });
  });

  it("validates the email first", async () => {
    const result = await requestPasswordReset({ email: "nope" });

    expect(result).toEqual({ ok: false, error: "Enter a valid email", status: 422 });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe("resetPassword", () => {
  const values = { password: "new-password", confirm_password: "new-password" };

  it("sets the new password and redirects to the login page", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await expect(resetPassword("token-1", values)).rejects.toThrow("NEXT_REDIRECT");

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/reset-password", {
      method: "POST",
      body: { token: "token-1", password: "new-password" },
      auth: false,
    });
    expect(redirect).toHaveBeenCalledWith("/login?reset=1");
  });

  it("returns the API error for an expired link", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(400, "This reset link is invalid or has expired"));

    const result = await resetPassword("old-token", values);

    expect(result).toEqual({
      ok: false,
      error: "This reset link is invalid or has expired",
      status: 400,
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("checks that both passwords match", async () => {
    const result = await resetPassword("token-1", { ...values, confirm_password: "other" });

    expect(result).toEqual({ ok: false, error: "Passwords do not match", status: 422 });
  });
});
