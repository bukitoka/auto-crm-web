# Auto CRM Web

**Keep the conversation, the deal, and the next follow-up together.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](package.json)
[![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](package.json)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](src/app/globals.css)
[![Coverage 82.5%](https://img.shields.io/badge/coverage-82.5%25-238636)](#checks)
[![CI](https://github.com/bukitoka/auto-crm-web/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/bukitoka/auto-crm-web/actions/workflows/ci.yml)

The web app for Auto CRM gives small sales teams a shared place for contacts, companies,
deals, and follow-ups. Start with the assistant, check your pipeline in Insights, or work
through the deals board and task lists.

CRM requests go through Next.js to the [FastAPI backend](https://github.com/bukitoka/auto-crm-api).
Pages load data on the server, and changes go through Server Actions. The login token stays
in an httpOnly cookie rather than client-side storage. Images can load directly from object storage.

[Run locally](#run-locally) · [Find your way around](#find-your-way-around) · [Checks](#checks) · [Code map](#code-map) · [Production](#production)

## What you can do

| Work                  | In the app                                                                         |
| --------------------- | ---------------------------------------------------------------------------------- |
| Manage relationships  | Contacts, companies, activity timelines, image uploads, and CSV import/export      |
| Move deals forward    | Drag-and-drop pipeline, table view, closing dates, and task completion             |
| Ask the assistant     | Saved chats, file attachments, CRM actions, charts, metric cards, and tables       |
| Choose your next step | Insights with pipeline value, wins, lead counts, and overdue follow-ups            |
| Find a record         | Keyboard-accessible global search across contacts, companies, and deals            |
| Oversee the workspace | Team performance, admin accounts, pipeline settings, and webhooks for super admins |

## Run locally

You need [Bun 1.4.5](https://bun.sh) and the API running at `http://localhost:8000`.
Follow the [API setup guide](https://github.com/bukitoka/auto-crm-api#run-locally) first.

```bash
cp .env.example .env.local
bun install --frozen-lockfile
bun dev
```

Open http://localhost:3000. On an empty database, the app guides you through creating the
first super admin. That account creates the admins; there is no public sign-up.

<details>
<summary>Try the seeded workspace</summary>

Run `uv run seed` in the API repository against an empty database to load demo records.

| Login                                                                             | Password          | Role        |
| --------------------------------------------------------------------------------- | ----------------- | ----------- |
| `superadmin@example.com`                                                          | `superadmin12345` | Super admin |
| `alex@example.com`, `sarah@example.com`, `marco@example.com`, `priya@example.com` | `admin12345`      | Admin       |

Admins manage their own CRM records. Super admins can read across admins and manage the
workspace, but cannot edit CRM records.

</details>

### Configuration

Set these in `.env.local` for development or in your hosting environment for production.

| Variable       | Purpose                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `API_URL`      | Server-only API base URL, including `/api/v1`. Defaults to `http://localhost:8000/api/v1`.                                             |
| `GITHUB_TOKEN` | Optional server-only token for fetching repository changelogs in the About dialog. Static release notes are used if the request fails. |

Configure `DEEPSEEK_API_KEY`, email, and object storage in the **API repository**. Without
an AI key, the rest of the CRM still works, but AI requests return `503`. The web app does
not need the model provider's credentials.

## Find your way around

| Page                                 | Purpose                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `/assistant`                         | Home page with suggested prompts, a workspace snapshot, and a new chat                             |
| `/assistant/history`                 | Saved conversations                                                                                |
| `/dashboard`                         | Insights: four headline metrics, pipeline chart, today's focus, closing deals, and recent activity |
| `/contacts`, `/companies`            | Relationship records and their details                                                             |
| `/deals`                             | Pipeline board and sortable table                                                                  |
| `/calendar`                          | Personal events, CRM record links, and filters for task and deal dates                             |
| `/documents`                         | Private picture and document library, record links, and Ask AI                                     |
| `/follow-ups`                        | Overdue work, deals needing a next step, and leads awaiting contact                                |
| `/tasks`                             | Follow-ups, status, priority, and overdue filters                                                  |
| `/search`                            | Full search results across contacts, companies, and deals                                          |
| `/team`, `/automations`, `/ai-chats` | Super admin workspace controls and conversation oversight                                          |
| `/settings`                          | Account and appearance settings                                                                    |

### Connected workflows

- In **Calendar**, open a contact-linked event for Call Prep. After the event ends, open **Draft meeting follow-up**, paste your notes, and review suggested activities, tasks, and an email before requesting changes.
- Upload a file in **Documents** or from a contact, company, or deal’s Documents link. Picture previews and downloads require ownership. **Ask AI** prepares a message to summarize the selected file.
- From **Follow-ups**, complete overdue work, schedule tasks, or open Call Prep. Contact and company detail pages also offer **Review duplicates**.
- **Automations** gives the super admin lead-routing settings, response targets, delivery history, and manual retries. Regular admins can run an optional Google or Microsoft import from **Settings**.
- Chat titles are generated automatically when available. The compact pinned bar keeps the title and menu visible while the messages scroll.

Run `make help` for frontend shortcuts. Recent activity shows up to five entries with expandable notes and scrolls internally when needed.

| Shortcut                | Action                                                          |
| ----------------------- | --------------------------------------------------------------- |
| `⌘K` / `Ctrl+K`         | Open global search                                              |
| `⌘J` / `Ctrl+J`         | Open the contextual assistant panel outside the assistant pages |
| `⌘B` / `Ctrl+B`         | Toggle the sidebar                                              |
| `Enter` / `Shift+Enter` | Send an assistant message / add a new line                      |

### Appearance

Light and dark themes keep surfaces neutral. Pine and sage provide brand accents, while
success, warning, information, and destructive states retain distinct colors. Buttons use flat fills.

- [globals.css](src/app/globals.css) defines `brand-50` through `brand-900` and the theme-specific
  semantic tokens. Prefer `bg-primary`, `text-muted-foreground`, and `text-success` in components.
- [color-tones.ts](src/lib/color-tones.ts) shares icon treatments between Insights and assistant shortcuts.
- [Fixel Text](https://github.com/MacPaw/Fixel) by MacPaw is bundled locally in
  [src/app/fonts](src/app/fonts/), with its [SIL Open Font License](src/app/fonts/OFL.txt).

## Checks

The latest local run on **2026-11-12** passed **523 tests** with **82.5% statement coverage**.
The coverage badge records that local result and is updated manually. Coverage excludes route
files, generated UI components, test helpers, and type-only modules; see
[vitest.config.mts](vitest.config.mts) for the exact scope and thresholds.

Run the same checks as [CI](.github/workflows/ci.yml):

```bash
bun run check
bun run typecheck
bun run test:coverage
bun run build
```

| For this task                                 | Run                   |
| --------------------------------------------- | --------------------- |
| Start the development server                  | `bun dev`             |
| Fix lint and formatting issues                | `bun run check:fix`   |
| Quick unit-test run                           | `bun run test`        |
| Watch tests while editing                     | `bun run test:watch`  |
| Open the coverage report after a coverage run | `coverage/index.html` |
| Serve the production build                    | `bun run start`       |

Tests sit beside the code: `.test.ts` files run in Node, and `.test.tsx` files run in jsdom.
They use mocked API requests and do not require a running backend. These checks do not
replace browser testing against a running application.

## Code map

```text
src/
├── app/                 # Auth and dashboard routes, exports, logout, global styles
├── features/<name>/
│   ├── api.ts           # Server-side reads
│   ├── actions.ts       # Server Actions
│   ├── schemas.ts       # Zod form schemas
│   ├── types.ts         # API types
│   └── components/      # Feature-specific UI
├── components/
│   ├── ui/              # Shared shadcn/ui components
│   ├── layout/          # Sidebar, header, global search, theme controls
│   └── shared/          # Reusable forms, lists, uploads, and states
├── lib/                 # API client, session cookies, formatting, URL helpers
└── test/                # Setup, mocks, and factories
```

Start with [features/companies](src/features/companies/) for a small feature example.
List filters, sorting, and pagination live in URL search parameters.

The full-page assistant and contextual panel share
[chat-thread.tsx](src/features/assistant/components/chat-thread.tsx). Global search lives in
[header-search.tsx](src/components/layout/header-search.tsx). CSV downloads use
[the export route](src/app/export/[entity]/route.ts), which forwards the session token server-side.

This project uses Next.js 16 APIs. Before changing framework behavior, read the matching
local documentation in `node_modules/next/dist/docs/`, as described in [AGENTS.md](AGENTS.md).

## Production

The project targets Vercel. Set `API_URL` to the deployed backend's `/api/v1` base URL in
Vercel's environment settings. [GitHub Actions](.github/workflows/ci.yml) runs the quality
checks; Vercel handles builds and deployment.

For another Node-compatible host, run `bun run build` followed by `bun run start`. Serve
the app over HTTPS because production session cookies are marked `secure`.

[next.config.ts](next.config.ts) sets response security headers and a 16 MB Server Action
body limit. Assistant messages accept up to three attachments of 5 MB each. CRM pages
render per request using the current user's session.

Production Vercel builds show a UTC date-based version and a short commit SHA in the About
dialog. Other builds show `dev`; the backend version comes from its `/health` endpoint.
