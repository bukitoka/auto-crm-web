import { afterEach, describe, expect, it, vi } from "vitest";
import { cookieStore, setCookie } from "@/test/next-mocks";
import { SESSION_COOKIE } from "./constants";
import { clearSessionToken, getSessionToken, setSessionToken } from "./session";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("session", () => {
  it("reads the token from the session cookie", async () => {
    setCookie(SESSION_COOKIE, "jwt-123");

    await expect(getSessionToken()).resolves.toBe("jwt-123");
  });

  it("returns undefined without a session cookie", async () => {
    await expect(getSessionToken()).resolves.toBeUndefined();
  });

  it("stores the token in an httpOnly cookie for one day", async () => {
    await setSessionToken("jwt-123");

    expect(cookieStore.set).toHaveBeenCalledWith(SESSION_COOKIE, "jwt-123", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    await expect(getSessionToken()).resolves.toBe("jwt-123");
  });

  it("marks the cookie secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await setSessionToken("jwt-123");

    expect(cookieStore.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      "jwt-123",
      expect.objectContaining({ secure: true }),
    );
  });

  it("deletes the session cookie", async () => {
    setCookie(SESSION_COOKIE, "jwt-123");

    await clearSessionToken();

    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
    await expect(getSessionToken()).resolves.toBeUndefined();
  });
});
