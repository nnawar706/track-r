# Architecture

## Folder Structure

```
track-r
├── CLAUDE.md
├── context/
│   ├── architecture.md
│   ├── project-overview.md
│   ├── build-plan.md
│   ├── code-standards.md
│   ├── ui-context.md
│   └── progress-tracker.md
│
├── client/                      # Vite + React + TypeScript
│   ├── public/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css            # Tailwind + shadcn CSS variables (ui-context.md palette)
│       ├── api/
│       │   ├── client.ts        # fetch wrapper, base URL, error handling
│       │   ├── entries.ts
│       │   ├── timesheets.ts
│       │   └── projects.ts
│       ├── components/
│       │   ├── ui/              # shadcn primitives (generated, not hand-written)
│       │   ├── SummaryCards.tsx
│       │   ├── EntryList.tsx        # day-grouped table for the current week
│       │   ├── NewEntryModal.tsx
│       │   ├── TimesheetHistoryList.tsx
│       │   ├── TimesheetDetailModal.tsx
│       │   └── ProjectsTable.tsx
│       ├── hooks/
│       │   └── 
│       ├── pages/
│       │   ├── Home.tsx         # '/'
│       │   └── Projects.tsx     # '/projects'
│       ├── lib/
│       └── types/
│           └── index.ts         # shared TS types: Project, Timesheet, TimeEntry, TimesheetDetail
│
└── server/                      # Express (JS)
    ├── index.js                 # app bootstrap, middleware, route mounting
    ├── db/
    │   ├── connection.js         # better-sqlite3 instance
    │   ├── schema.sql            # CREATE TABLE statements
    ├── models/
    │   ├── projectModel.js       # raw SQL: findAll, findById, create, totalHoursByProject
    │   ├── timesheetModel.js      # findByWeekStart, getOrCreate, listAll, markSubmitted
    │   └── timeEntryModel.js      # findByTimesheet, create, update, delete
    ├── controllers/
    │   ├── projectController.js
    │   ├── timesheetController.js
    │   └── timeEntryController.js
    ├── routes/
    │   ├── projectRoutes.js
    │   ├── timesheetRoutes.js
    │   └── timeEntryRoutes.js
    ├── lib/
    │   └── 
    └── __tests__/
        ├── week.test.js
        ├── timeEntry.test.js
        └── timesheet.test.js
```

---

## System Boundaries

Two processes, one boundary: an HTTP API.

client (React) -> HTTP/JSON -> server (Express, owns all business rules and validation) -> sql -> SQLite -> server (Express) -> client (React)

- **Client** owns presentation only: rendering, form state, optimistic UI, date-range display formatting. It holds **no business rules** — it doesn't decide whether a week is locked or whether an entry is valid, it just reflects what the API returns and disables controls the API would reject.
- **Server** owns every rule that matters if broken: week-boundary calculation, submit-lock enforcement, validation ( 0 < hours < 20, project required, date within timesheet's week), and all aggregation (totals, billable sums).
- **Database** is a single SQLite file, accessed only by the server.

There is no auth boundary (no session, no user identity) — see `project-overview.md`'s Out of Scope.

---

## Dependency Direction

```
pages/  →  components/ (uses lib/week.ts; pure, no dependencies)  →  api/  →  (network boundary)  →  routes/  →  controllers/  →  models/  →  db/
              
```

- **Pages** depend on **components**; components never depend on pages (no upward imports).
- **Components** depend on **api/** functions to fetch/mutate data; components never construct SQL or know about the server's internal structure — they only know the JSON shape returned.
- **Server-side:** `routes` depend on `controllers`, `controllers` depend on `models`, `models` depend on `db/connection.js`. Nothing flows backward — a model never imports a controller, a controller never imports a route.
- `lib/week.ts` (client) and `lib/week.js` (server) are two different files, not shared.
- **Business rules live server-side only** (see System Boundaries).

---

## Data Flow (primary journey: logging an entry)

```
1. User opens NewEntryModal on Home.tsx
   → client/src/lib/week.ts computes the current timesheet's week range,
     used only to constrain the date picker's min/max in the UI.

2. User submits the form
   → components/NewEntryModal.tsx calls api/entries.ts → POST /api/entries
     body: { date, projectId, hours, billable, note }

3. Server: routes/timeEntryRoutes.js → controllers/timeEntryController.js
   a. Validates payload (0 < hours < 20, projectId present)
   b. server/lib/week.js derives week_start from `date`
   c. models/timesheetModel.js: getOrCreate(week_start)
        - if a submitted timesheet already exists for that week → 403, reject
        - else find-or-create the draft row
   d. models/timeEntryModel.js: create(entry, timesheetId)
   e. Controller returns the created entry as JSON

4. Client receives the new entry
   → Home.tsx refetches (or optimistically appends) the current week's
     entries and summary cards re-render with updated totals.
```

Submission flow (`POST /api/timesheets/:weekStart/submit`) follows the same shape: controller checks entry count > 0 and current status ≠ submitted, model updates `status` and `submitted_at`, client refetches and the UI locks (modal's "add entry" trigger becomes unavailable, existing rows render read-only).

---

## Database Schema

```sql
CREATE TABLE project (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  client_name   TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE timesheet (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start    TEXT NOT NULL UNIQUE,     -- 'YYYY-MM-DD', always a Monday
  week_end      TEXT NOT NULL UNIQUE,     -- 'YYYY-MM-DD', always a Friday
  status        TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'submitted'
  submitted_at  TEXT
);

CREATE TABLE time_entry (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  timesheet_id  INTEGER NOT NULL REFERENCES timesheet(id),
  project_id    INTEGER NOT NULL REFERENCES project(id),
  date          TEXT NOT NULL,             -- 'YYYY-MM-DD'
  hours         REAL NOT NULL,
  billable      INTEGER NOT NULL DEFAULT 1,
  note          TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, date)
);
```

---

## Database Relationship Rules

- **`project` → `time_entry`**: one-to-many. A project can exist with zero entries. A `time_entry` cannot exist without a valid `project_id` (FK enforced; enable `PRAGMA foreign_keys = ON` — SQLite does not enforce FKs by default).
- **`timesheet` → `time_entry`**: one-to-many. A `time_entry` always belongs to exactly one `timesheet`, resolved server-side from its `date` — never chosen directly by the client.
- **`timesheet.week_start` is unique**: enforces exactly one timesheet per calendar week; the `getOrCreate` pattern in `timesheetModel.js` is the only path that creates a row, preventing duplicates.
- **`time_entry(project_id, date)` is unique**: enforces the project-overview.md rule that a project cannot have two entries on the same date. Enforced at the database level (`UNIQUE` constraint), not just in application code — a duplicate insert raises a SQLite constraint error that the controller translates into a human-readable message.
- **Write-lock rule (enforced in controllers, not the database):** if `timesheet.status = 'submitted'`, no `time_entry` referencing it may be created, updated, or deleted.
- **No cascading deletes**: projects and timesheets are not expected to be deleted in this build (no delete UI for either) — `ON DELETE` behavior is left at SQLite's default (restrict).