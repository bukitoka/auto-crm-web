# Auto CRM web

The web app for Auto CRM, built with Next.js 16, React 19, Tailwind CSS v4 and shadcn/ui.

The browser only talks to Next.js. Pages fetch data on the server and every change goes through a
Server Action, so the login token stays in an httpOnly cookie and never reaches client code.

## Run it

You need [Bun](https://bun.sh) and the API running on http://localhost:8000.

```bash
cp .env.example .env.local
bun install
bun dev
```

Open http://localhost:3000. With the demo data loaded you can log in as `alex@example.com` /
`admin12345` (an admin) or `superadmin@example.com` / `superadmin12345`. On an empty database the app
opens a one-time setup page to create the super admin, who then creates the admins. There is no public sign-up.

## Commands

| Command | |
| --- | --- |
| `bun dev` | Dev server |
| `bun run check:fix` | Lint and format |
| `bun run typecheck` | Type check |
| `bun run test` | Unit tests (`test:watch`, `test:coverage` also exist) |
| `bun run build` | Production build |

Before pushing, run `bun run check && bun run typecheck && bun run test && bun run build`.

## Folder structure

```
src/
  app/                 routes: (auth) pages, (dashboard) pages, export/ and logout/ route handlers
  features/<name>/     one folder per feature
    api.ts             server-side reads
    actions.ts         Server Actions (writes)
    schemas.ts         zod form schemas
    types.ts           API types
    components/
  components/
    ui/                shadcn/ui, generated
    layout/, shared/   app shell and reusable pieces
  lib/                 api-client.ts, session.ts, formatting and URL helpers
  test/                test setup, mocks and factories
```

A few places that are easy to miss:

- The assistant is the home page (`/assistant`). The header "Ask AI" panel and the full page share
  `features/assistant/components/chat-thread.tsx`.
- The deals board and the "Edit pipeline" sheet are in `features/deals/components/`.
- Header search is `components/layout/header-search.tsx`.
- Image uploads go through `components/shared/image-upload.tsx` and `lib/uploads.ts`.
- CSV downloads go through `app/export/[entity]/route.ts`, which adds the session token server-side.

## Working on it

- To add a feature, copy `features/companies`. It is the smallest complete example.
- List filters, sorting and paging live in the URL, so client controls only change search params.
- Tests sit next to the code (`actions.ts` and `actions.test.ts`). `.test.ts` files run in Node,
  `.test.tsx` files in jsdom.
- If styles look stale after editing `globals.css`, stop the dev server, delete `.next` and start it
  again.
