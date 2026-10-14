import { beforeEach, vi } from "vitest";
import { resetNextMocks } from "./next-mocks";

/**
 * Shared setup for every test file (node and jsdom).
 * Mocks the Next.js server/runtime modules that only work inside a real
 * Next.js request, plus `sonner` so tests can assert on toasts.
 */

// `import "server-only"` throws outside a React Server environment. Tests import
// server modules (api-client, actions, api.ts) directly, so make it a no-op.
vi.mock("server-only", () => ({}));

// Keep the real `redirect` (it throws NEXT_REDIRECT, like in production) but
// wrap it in vi.fn so tests can assert the target. Hooks read from next-mocks.
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  const mocks = await import("./next-mocks");
  return {
    ...actual,
    redirect: vi.fn(actual.redirect),
    useRouter: () => mocks.router,
    usePathname: () => mocks.getPathname(),
    useSearchParams: () => mocks.getSearchParams(),
  };
});

vi.mock("next/headers", async () => {
  const mocks = await import("./next-mocks");
  return { cookies: vi.fn(async () => mocks.cookieStore) };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
  Toaster: () => null,
}));

beforeEach(() => {
  resetNextMocks();
});
