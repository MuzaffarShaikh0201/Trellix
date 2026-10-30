# Trellix

Frontend for Trellix — a software development project manager to organize dev projects, link repos, and track delivery. API contract: backend OpenAPI docs at your configured `VITE_API_URL` (e.g. `/docs`).

## Getting started

```bash
cp .env.example .env   # set VITE_API_URL, e.g. http://localhost:5000
npm install
npm run dev            # http://localhost:5173
```

The backend only allows requests from `http://localhost:5173` (its `FRONTEND_URL`), so keep the dev server on that port.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) for date, timeline, task-board, note and session helpers |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | Browser tests (Playwright) against a running backend |

### Browser tests

`npm run test:e2e` drives your installed Google Chrome (no Playwright browser download). It needs the backend running at `E2E_API_URL` (default `http://127.0.0.1:5000`) and starts the dev server if one isn't running. Each run signs up fresh `e2e-*@example.com` accounts, so point it at a local or test backend, not production. The API allows only 5 sign-ups per IP per hour and a run uses 3, so start the backend with `RATE_LIMIT_ENABLED=false` when running the suite more than once an hour.

## App structure

| Route | Page |
| --- | --- |
| `/` | Dashboard: stats, recent projects, deadlines, pinned notes |
| `/projects` | Projects: grid, list or board; search, status filters, favorites, archive |
| `/projects/:id` | Project: overview (inline editing), notes, tasks board, activity timeline |
| `/notes`, `/notes/new`, `/notes/:id` | Notes: two-pane reader or grid; Markdown editor with autosave |
| `/calendar` | Month and agenda views of project dates and task due dates; click a date for details |
| `/settings/:section` | Profile (email verification), security, appearance (theme, density) |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth flows |

Shortcuts: <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> opens search, <kbd>⌘S</kbd> / <kbd>Ctrl S</kbd> saves a note.

## Notes for development

- **Theme tokens** live in `src/styles/index.css` (`--bg`, `--surface`, `--line`, `--fg`, `--muted`, plus `--overlay`, `--overlay-shadow` and `--backdrop` for dialogs and menus). Dark mode follows the in-app theme via `data-theme`.
- **Data fetching** goes through TanStack Query; query keys and shared hooks are in `src/lib/queries.ts`, `src/lib/noteQueries.ts` and `src/lib/taskQueries.ts`.
- **Sessions**: access tokens last 15 minutes. The app renews them about a minute before expiry (`src/lib/auth/sessionKeepAlive.ts`) and again after any `401`. Refresh tokens work once, so tabs take turns renewing (Web Locks). The app signs out only when the API rejects the refresh token; a rate limit or network error keeps the session.
- **Rate limits**: a `429` shows the API's message, and buttons like "Log in" and "Resend link" count down until the wait ends (`src/hooks/useCooldown.ts`).
- **Deep links**: `/projects/:id?tab=tasks&task=:taskId` opens a task; notifications and the calendar use it.
- **Emails** (verification, password reset) are sent by the backend. Without SMTP settings it writes the links to its log instead.
