# Auto CRM — Web

Frontend for Auto CRM, an AI-assisted CRM. Built with Next.js 16 (App Router, full SSR),
React 19, TypeScript 7, Tailwind CSS v4, shadcn/ui, Bun and Biome.

The browser **never** talks to the FastAPI backend directly. Pages load data in Server
Components, and every change goes through a Server Action. The JWT sits in an httpOnly
cookie, and `src/lib/api-client.ts` forwards it on every request.

```
Browser ──► Next.js (Server Components + Server Actions) ──► FastAPI (/api/v1)
```

## Setup

Requirements: [Bun](https://bun.sh) ≥ 1.3 and the API running on `http://localhost:8000`
(see `../auto-crm-api`).

```bash
cp .env.example .env.local   # API_URL=http://localhost:8000/api/v1
bun install
bun dev                      # http://localhost:3000
```

Open `/register` to create an account. The first account becomes the workspace admin.

## Scripts

| Script | What it does |
| --- | --- |
| `bun dev` | Dev server (Turbopack) |
| `bun run build` | Production build |
| `bun start` | Serve the production build |
| `bun run lint` | Biome lint only |
| `bun run format` | Biome format (writes) |
| `bun run check` | Biome lint + format + import sorting (CI gate) |
| `bun run check:fix` | Same as `check`, but applies safe fixes |
| `bun run typecheck` | `next typegen && tsc --noEmit` (TypeScript 7) |
| `bun run test` | Run the unit tests once (Vitest) |
| `bun run test:watch` | Run the unit tests in watch mode |
| `bun run test:coverage` | Run the unit tests with a coverage report and thresholds |

Run `bun run check && bun run typecheck && bun run test && bun run build` before pushing.

## Folder structure

```
src/
  proxy.ts                      # Next 16 "middleware": redirects by session cookie
  app/
    (auth)/login, register      # public pages
    (dashboard)/layout.tsx      # sidebar shell; loads the current user
    (dashboard)/dashboard, contacts, contacts/[id], companies, companies/[id],
                deals, deals/[id], tasks, automations, settings, search
    logout/route.ts             # clears the cookie (used when the API returns 401)
  components/
    ui/                         # shadcn/ui (generated, not linted)
    layout/                     # sidebar, header, breadcrumbs, theme toggle, user menu
    shared/                     # page header, pagination, form fields, dialogs, empty states
  features/<feature>/
    api.ts                      # server-only reads (used by Server Components)
    actions.ts                  # "use server" mutations + revalidatePath
    schemas.ts                  # zod form schemas + form <-> API payload mappers
    types.ts                    # API types (edit these if the API shape changes)
    components/                 # feature UI
  hooks/                        # client hooks (URL search-param updater, …)
  test/                         # test setup, Next.js mocks, factories, render helper
  lib/
    api-client.ts               # server-only apiFetch + ApiError
    session.ts                  # httpOnly cookie get/set/clear
    action-result.ts            # ActionResult type, runAction(), parseInput()
    toast-result.ts             # client: toast an ActionResult (handles 503 = AI off)
    format.ts, options.ts, search-params.ts, form.ts, constants.ts, types.ts
```

Features: `auth`, `users`, `companies`, `contacts`, `deals`, `activities`, `tasks`,
`dashboard`, `ai`, `automations`, `search`, `settings`.

## How data flows

- **Reads**: a page (Server Component) calls a function in `features/x/api.ts`, which calls
  `apiFetch<T>()`. List pages read `page`, `search` and filters from `searchParams`, so
  every filter is a URL. Client filter controls only change the URL.
- **Writes**: a client form (react-hook-form + zod) calls a Server Action in
  `features/x/actions.ts`. The action validates the input again with the same zod schema,
  calls the API, runs `revalidatePath()`, and returns an `ActionResult`
  (`{ ok: true, data }` or `{ ok: false, error, status }`). The client then calls
  `toastResult(result, "Saved")`.
- **Errors**: `apiFetch` throws an `ApiError` (`status`, `message`, `detail`). A 401
  redirects to `/logout`, which clears the cookie. Pages show `error.tsx` or
  `not-found.tsx`. Actions turn errors into `ActionResult`s.
- **AI**: AI actions can take a few seconds, so their buttons show a pending state. When
  the API returns `503` (no `DEEPSEEK_API_KEY` configured), the user sees a friendly
  warning toast instead of an error.

## Adding a feature

Example: "products".

1. `src/features/products/types.ts`: the API response and payload types.
2. `api.ts`: `import "server-only"` and functions that call `apiFetch<Paginated<Product>>("/products", { query })`.
3. `schemas.ts`: a zod form schema, empty defaults, and `toProductPayload()` (use
   `emptyToNull` for optional strings).
4. `actions.ts`: `"use server"`. Wrap each action in `parseInput()` + `runAction()`, then
   `revalidatePath("/products")`.
   If a list page reads filters from the URL, add a `productFiltersFromParams(params)` helper
   in `api.ts` (see `contactFiltersFromParams`) so the mapping can be unit tested.
5. `components/`: `product-form.tsx` (uses `TextField`/`SelectField` from
   `components/shared/form-fields`), `product-form-dialog.tsx` (uses `FormDialog`), and
   `products-table.tsx`.
6. `src/app/(dashboard)/products/page.tsx` + `loading.tsx`. Then add the nav item in
   `components/layout/nav-items.ts` (and a breadcrumb label in `segmentLabels`).
7. Tests: `schemas.test.ts`, `actions.test.ts`, `api.test.ts` and a test for each
   interactive component (see [Testing](#testing)).

Copy an existing feature like `companies` as a template: it is the smallest complete
example.

## Testing

Unit tests use [Vitest](https://vitest.dev) with
[Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
(`@testing-library/react`, `user-event`, `jest-dom`) and jsdom.

```bash
bun run test            # run everything once
bun run test:watch      # re-run on save
bun run test:coverage   # + coverage table (HTML report in coverage/index.html)
bunx vitest run src/features/deals   # only one folder
```

### Layout

- Tests sit **next to the code** they test: `actions.ts` → `actions.test.ts`,
  `move-stage-select.tsx` → `move-stage-select.test.tsx`. No `__tests__` folders.
- The file extension picks the environment (two Vitest projects in `vitest.config.mts`):
  - `*.test.ts` runs in **node**: `lib/`, `proxy.ts`, and each feature's `schemas.ts`,
    `actions.ts` and `api.ts`.
  - `*.test.tsx` runs in **jsdom**: client components and hooks.
- `src/test/` holds the shared helpers:

| File | What it is for |
| --- | --- |
| `setup.ts` | Runs before every test file. Mocks `server-only`, `next/navigation`, `next/headers`, `next/cache` and `sonner`. |
| `setup-dom.ts` | jsdom only: `jest-dom` matchers, cleanup, small browser polyfills Radix UI needs. |
| `next-mocks.ts` | State behind the Next.js mocks: `router`, `setUrl()`, `cookieStore`, `setCookie()`. |
| `factories.ts` | `makeContact()`, `makeDeal()`, `makeStage()`, `makeTask()`, `makeCompany()`, `makeWebhook()`, `makePage()`. |
| `render.tsx` | `renderWithUser(ui)`: renders inside the root providers and returns a `user-event` `user`. |
| `deferred.ts` | A promise you resolve by hand, to test pending states. |

Test files import `describe`/`it`/`expect`/`vi` from `"vitest"` explicitly (no globals).
Every mock is reset before each test (`mockReset: true`), so tests don't leak into each other.
`API_URL` is fixed to `http://api.test/api/v1` in the config.

### Mocking conventions

- **Next.js** is mocked once in `setup.ts`. Arrange and assert through `@/test/next-mocks`:
  - `setUrl("/contacts?status=lead")` sets what `usePathname()`/`useSearchParams()` return.
  - `expect(router.replace).toHaveBeenCalledWith(...)` / `router.push`.
  - `setCookie(SESSION_COOKIE, "jwt")` and `expect(cookieStore.set)...` for `cookies()`.
  - `redirect` is the real one wrapped in `vi.fn`. It still throws `NEXT_REDIRECT`, so
    test it with `await expect(login(values)).rejects.toThrow("NEXT_REDIRECT")` and
    `expect(redirect).toHaveBeenCalledWith("/dashboard")`.
  - `revalidatePath` (from `next/cache`) is a `vi.fn`: `expect(revalidatePath).toHaveBeenCalledWith("/deals")`.
- **Toasts**: `sonner` is mocked. Assert with `expect(toast.success).toHaveBeenCalledWith("Saved")`.
- **Server Actions tests** mock only the HTTP call and keep `ApiError` real:

  ```ts
  vi.mock("@/lib/api-client", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/api-client")>()),
    apiFetch: vi.fn(),
  }));
  ```

- **`api.ts` tests** mock the whole client: `vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }))`.
- **Component tests** mock the feature's Server Actions module and control its result:

  ```ts
  vi.mock("../actions", () => ({ moveDealToStage: vi.fn() }));
  vi.mocked(moveDealToStage).mockResolvedValue({ ok: true, data: makeDeal() });
  ```

- Query by role and label (`getByRole("button", { name: "Save changes" })`,
  `getByLabelText("Email")`), not by class names.
- For a pending state, return a `deferred()` promise from the action and resolve it
  before the test ends. React keeps later transitions pending while an earlier async
  action is unfinished, so a promise that never resolves breaks the tests that run after it.

### Testing a new feature

1. `schemas.test.ts`: one valid form, each validation message, and the
   form → payload mapping (empty string → `null`, number conversion, …).
2. `actions.test.ts`: for each action, check the endpoint, method and body sent to `apiFetch`,
   the `revalidatePath` calls, a validation failure (422, API not called) and an API error
   (`ActionResult` with `ok: false`, no revalidation).
3. `api.test.ts`: the path and `query` passed to `apiFetch`, and any `…FromParams` helper.
4. `components/*.test.tsx`: the user flow. Fill the form, submit, check the action call,
   the toast and the navigation.

### Coverage

`bun run test:coverage` fails below these thresholds (see `vitest.config.mts`):

| Files | Lines / statements / functions | Branches |
| --- | --- | --- |
| `src/lib/**`, `src/proxy.ts`, `src/features/**/{schemas,actions,api}.ts` | 95% | 90% |
| Whole project (components included) | 65% / 65% / 60% | 55% |

The report leaves out `src/components/ui/**` (shadcn generated), `src/app/**` (route files,
better covered by end-to-end tests) and `types.ts` files.

## Theming

- `next-themes` manages light, dark and system themes (`class` attribute). Users switch
  with the header toggle or on the Settings page.
- `src/app/globals.css` defines the brand scale with `@theme static` as `brand-50 … brand-950`
  (palette anchors: `#B0E4CC` = 200, `#408A71` = 600, `#285A48` = 800, `#091413` = 950).
  You can use utilities like `bg-brand-800` or `text-brand-200` anywhere.
- The shadcn semantic tokens (`--background`, `--primary`, `--sidebar-*`, `--chart-1..5`, …)
  map onto that scale in `:root` (light) and `.dark`. All values are hex.
  - Light: white surfaces, `primary = brand-800`, `ring = brand-600`, `accent = brand-50`,
    and a `brand-50` tinted sidebar.
  - Dark: `background = brand-950`, cards slightly lighter (`#0f211d`),
    `primary = brand-200` on `brand-950` text.
  - Charts use `brand-200 … brand-800`.
- To restyle, change the token values, not the components.

## Notes and decisions

- **Cache Components is turned off.** `create-next-app` enables `cacheComponents` by default.
  Every CRM page is per-user and rendered at request time, so this project uses the classic
  dynamic rendering model. Reading `cookies()` makes a route dynamic automatically, and
  you don't need `<Suspense>` around every session read. You can switch it on later in
  `next.config.ts`.
- **TypeScript 7** (`typescript@7`, the native compiler) is the project compiler.
  `next build` also type-checks successfully with it. `bun run typecheck` is the source of
  truth, and it runs `next typegen` first so that `PageProps`/`LayoutProps` exist.
- **Forms**: shadcn's current approach is `<Field>` + react-hook-form `<Controller>` +
  zod 4. The thin wrappers live in `components/shared/form-fields.tsx`.
- **shadcn/ui** uses the `radix-nova` style. Its components import `cn` from the
  `cn` package (shadcn's clsx + tailwind-merge replacement).
- **Deals board**: a canvas with drag and drop (`@dnd-kit/core`). Dropping a card calls
  `PATCH /deals/{id}/stage` so the API emits `deal.stage_changed`, `deal.won` and `deal.lost`.
- **Image uploads** (contact photo, company logo, your avatar): `components/shared/image-upload.tsx`
  sends a `FormData` to a Server Action, which checks it (`lib/uploads.ts`) and forwards it to the API
  as multipart (`apiFetch` passes `FormData` through). The API stores a WebP in MinIO and returns a
  presigned URL; `EntityAvatar` shows it, or the initials. `next.config.ts` allows 6 MB action bodies.
- **AI assistant (the home page)**: `/assistant` is the AI home, and signing in lands there (`HOME_PATH`).
  `/assistant/[id]` shows a saved chat, and `/assistant/history` lists all of them. The app sidebar shows "Recent chats"
  (`nav-chats.tsx`, loaded by the dashboard layout), and each chat has a shared ⋯ menu (`conversation-menu.tsx`).
  Admins manage everyone's chats on `/ai-chats`. Both the pages and the header **Ask AI** panel (⌘J) use
  `features/assistant/components/chat-thread.tsx` and the saved-conversation Server Actions. The old dashboard is **Insights** (`/dashboard`).
- **Global search**: `components/layout/header-search.tsx` is a combobox with grouped live results.
  It uses the `quickSearch` Server Action, debounced by 200 ms. ⌘K focuses it.
- **Smart capture** accepts text or a file: drop it, browse for it, or paste a screenshot (`capture-dropzone.tsx`).
  Files are read on the API with OCR and document parsers.
- **Email**: `features/emails` (Send email dialog, also used by the AI draft's **Send** button) and the
  forgot/reset password pages under `app/(auth)`. In development all mail lands in Mailpit
  (http://localhost:8026).
