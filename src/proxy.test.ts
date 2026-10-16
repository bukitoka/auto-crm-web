import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SESSION_COOKIE } from "@/lib/constants";
import { config, proxy } from "./proxy";

function request(path: string, { loggedIn = false } = {}) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"));
  if (loggedIn) req.cookies.set(SESSION_COOKIE, "jwt-123");
  return req;
}

/** `location` header of a redirect, or null when the request passes through. */
function redirectTarget(response: Response) {
  return response.headers.get("location");
}

describe("proxy", () => {
  describe("without a session", () => {
    it("redirects protected pages to /login and remembers where the user was going", () => {
      const response = proxy(request("/contacts?status=lead"));

      expect(response.status).toBe(307);
      const target = new URL(redirectTarget(response) ?? "");
      expect(target.pathname).toBe("/login");
      expect(target.searchParams.get("from")).toBe("/contacts?status=lead");
    });

    it("redirects / to /login without a `from` param", () => {
      const response = proxy(request("/"));

      expect(redirectTarget(response)).toBe("http://localhost:3000/login");
    });

    it("lets the user open the login page", () => {
      expect(redirectTarget(proxy(request("/login")))).toBeNull();
    });

    it("sends the removed /register page to login", () => {
      expect(redirectTarget(proxy(request("/register")))).toContain("/login");
    });

    it("lets /logout through", () => {
      expect(redirectTarget(proxy(request("/logout")))).toBeNull();
    });
  });

  describe("with a session", () => {
    it("lets protected pages through", () => {
      const response = proxy(request("/deals/123", { loggedIn: true }));

      expect(redirectTarget(response)).toBeNull();
      expect(response.headers.get("x-middleware-next")).toBe("1");
    });

    it("keeps logged-in users away from the auth pages", () => {
      expect(redirectTarget(proxy(request("/login", { loggedIn: true })))).toBe(
        "http://localhost:3000/assistant",
      );
    });

    it("lets /logout through so the cookie can be cleared", () => {
      expect(redirectTarget(proxy(request("/logout", { loggedIn: true })))).toBeNull();
    });
  });

  describe("matcher", () => {
    // Same regex Next.js builds from `config.matcher` (anchored path match).
    const matcher = new RegExp(`^${config.matcher[0]}$`);

    it.each([
      "/_next/static/chunks/app.js",
      "/_next/image",
      "/favicon.ico",
      "/logo.svg",
      "/images/photo.png",
    ])("skips public asset %s", (path) => {
      expect(matcher.test(path)).toBe(false);
    });

    it.each(["/", "/dashboard", "/contacts/123", "/login"])("runs on page %s", (path) => {
      expect(matcher.test(path)).toBe(true);
    });
  });
});
