import { vi } from "vitest";

/**
 * State behind the Next.js mocks registered in `setup.ts`.
 * Import from here in a test to arrange the URL/cookies or to assert calls:
 *
 *   setUrl("/contacts?status=lead");
 *   expect(router.replace).toHaveBeenCalledWith("/contacts", { scroll: false });
 */

/** Returned by the mocked `useRouter()`. */
export const router = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

const location = {
  pathname: "/",
  searchParams: new URLSearchParams(),
};

/** Set the URL seen by `usePathname()` and `useSearchParams()`. */
export function setUrl(url: string) {
  const parsed = new URL(url, "http://localhost");
  location.pathname = parsed.pathname;
  location.searchParams = new URLSearchParams(parsed.search);
}

export function getPathname() {
  return location.pathname;
}

export function getSearchParams() {
  return location.searchParams;
}

/** In-memory cookie jar behind the mocked `cookies()` from `next/headers`. */
const jar = new Map<string, string>();

export const cookieStore = {
  get: vi.fn((name: string) => {
    const value = jar.get(name);
    return value === undefined ? undefined : { name, value };
  }),
  has: vi.fn((name: string) => jar.has(name)),
  set: vi.fn((name: string, value: string, _options?: object) => {
    jar.set(name, value);
  }),
  delete: vi.fn((name: string) => {
    jar.delete(name);
  }),
};

/** Put a cookie in the jar (e.g. a session token) before calling server code. */
export function setCookie(name: string, value: string) {
  jar.set(name, value);
}

/** Called before every test by `setup.ts`. */
export function resetNextMocks() {
  jar.clear();
  setUrl("/");
}
