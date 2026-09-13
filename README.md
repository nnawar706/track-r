# Track-r

A lightweight time-tracking and timesheet-submission tool for consultants at a small firm.

## The Problem

Consultants at small firms tend to capture time badly: notes scattered across devices, a spreadsheet rebuilt from scratch every week, hours reconstructed from memory on Friday afternoon. That causes two failures — time gets lost (entries never logged at all) and time gets distorted (memory-reconstructed hours are inaccurate).

Track-r fixes this with two things: a fast way to log a time entry the moment work happens, and a weekly timesheet view a consultant can review and submit for approval.

## What I Built

- **Context files** - Context files for Claude reference describing project architecture, code standards, build plan and tracker
- **Dashboard (`/`)** — four summary cards (projects, entries this week, this week's status, this week's billable hours), a day-grouped list of the current week's entries with running totals, a "new entry" modal, a Submit action that locks the week, and a timesheet history list where each row opens a modal with that week's full entry detail.
- **Projects (`/projects`)** — a table of all projects with total billable hours logged against each, and a modal to add a new project.
- **Business rules enforced server-side, not just in the UI**: a timesheet is created automatically on its week's first entry (no separate "start a timesheet" step), Monday–Friday week boundaries with Sunday rolling back to that week's Monday, submitted weeks are read-only, a project/date pair is unique, and hours must be `0 < h < 20`.

### Stack

- **Client**: React + TypeScript (Vite), Tailwind, shadcn/ui (blue/white theme only, no dark mode)
- **Server**: Express (JS), better-sqlite3, Zod for request validation
- **Database**: SQLite, one file, accessed only by the server

### Why this shape

- **No auth, no accounts.** The brief is a single-user tool for one consultant's own time — a login screen would be pure overhead with nothing to protect.
- **Client holds no business logic.** All week-boundary math, lock enforcement, and validation live on the server; the client only renders what the API returns and disables controls the API would reject anyway. This keeps the rules in one place and makes the client trivially replaceable.
- **A timesheet is implicit, not a workflow step.** It's created the moment the first entry for its week is saved (`getOrCreate` in `timesheetModel.js`), because the user's mental model is "I log time," not "I open a timesheet and then log time."
- **Refetch over optimistic reconstruction.** Every mutation (create/edit/delete/submit) re-fetches from the server rather than hand-patching local state, so the UI can never drift from what's actually persisted — worth the extra round trip for a tool whose entire point is trustworthy numbers.
- **shadcn primitives only, no custom modal/table/form components** — keeps the UI consistent and small, per the project's own design constraint.

## How to Run It

Requires Node.js and npm.

**1. Install dependencies**

```bash
cd server && npm install
cd ../client && npm install
```

**2. Environment variables**

Already present as `.env.local` in each folder (not committed for a real deployment, but included here for local dev):

- `server/.env.local` → `PORT=5000`
- `client/.env.local` → `VITE_API_URL=http://localhost:5000/api`

**3. Start the server** (from `server/`)

```bash
npm run dev
```

Runs on `http://localhost:5000`. The SQLite file is created automatically on first run (`server/db/app.db`), schema applied, and two mock projects seeded if the database is empty.

**4. Start the client** (from `client/`, in a second terminal)

```bash
npm run dev
```

Opens on Vite's default port (`http://localhost:5173`). The client talks to the server via `VITE_API_URL` — CORS is already enabled server-side, no proxy needed.

**5. Run server tests** (from `server/`)

```bash
npm test
```

## Out of Scope

Deliberately not built, per the project brief and time constraint:

- Authentication or multi-user accounts
- An approval workflow (submit is one-way; there's no reviewer/approver role)
- A live start/stop timer — entries are logged after the fact with a manual hours value
- An "un-submit" or "request changes" path once a week is submitted
- Reporting, CSV/PDF export, or invoicing
- Deleting projects or timesheets (no delete UI for either; only time entries can be deleted, and only in draft)

## What I'd Do With Another Day

- **Finish the backend test suite** — `week.test.js` is solid, but timesheet lifecycle (create-on-first-entry, submit locking, zero-entry rejection, double-submit rejection) and the entry CRUD + validation paths (`timeEntry.test.js`, `timesheet.test.js`) are still open per the progress tracker.
- **Frontend tests** — everything client-side so far has been verified using Claude via Playwright passes during development, not with a committed test suite. I'd add component/integration tests for the entry form, the submit-lock UI state, and week-boundary edge cases (Sunday, year boundary) so regressions get caught automatically.
- **Empty/loading states polish** — the projects fetch currently degrades silently to a `0` count on failure rather than surfacing an error, which is fine for a summary number but worth revisiting if projects becomes a more load-bearing part of the page.
- **Polished UI** — The current UI is minimalist. It can be polished further.
