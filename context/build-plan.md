# Build Plan

## Core Principal

Full page UI built with mock data first - verified visually before any logic is written. Then functionality is built and wired to the UI step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

---

## Phase 1 — Foundation

### 01 Boilerplate

- Vite + React + TypeScript client; Tailwind initialized
- shadcn/ui installed, CSS variables set to the blue/white palette in ui-context.md
- Express server skeleton — routes/, controllers/, models/, db/, lib/ per architecture.md's folder structure
- better-sqlite3 installed, connection module created with PRAGMA foreign_keys = ON

---

### 02 Database Schema

- project table: id, name, client_name, created_at
- timesheet table: id, week_start, week_end, status, submitted_at
- time_entry table: id, timesheet_id, project_id, date, hours, billable, note, updated_at

Seed 2 mock projects for testing

---

### 03 Week/Date Library

- server/lib/week.js: getWeekStart(date), getWeekEnd(weekStart) — pure functions, no DB access
- Unit tests written before anything consumes them: Monday-Friday week case, year-boundary case, getWeekEnd(weekStart) is exactly 4 days after weekStart. WeekStart is that week's Monday, WeekEnd is that week's Friday.
client/src/lib/week.ts: cannot select Saturday/Sunday

---

## Phase 2 — Home Page

### 04 Home Page — Full UI

Build the complete home page UI with mock data. No API calls yet.

UI:

- Four summary cards — projects count, entries logged this week, this week's status, this week's billable hours
- Day-grouped entry table for "the current week" (mock entries), submit button below it
- Timesheet history list below that — mock rows of week range / status / entry count
- "New Entry" modal — date input (select current date as default), project select (checkbox to select last used project), hours input, billable toggle, note field, save button
"Timesheet Detail" modal — date range, status, total billable hours, last-updated, full entry table (opens from a mock history row click)

---

### 05 New Entry Logic

Wire the New Entry modal to the API.

- POST /api/entries — date, projectId, hours, billable, note
- Server derives timesheet_id from the submitted date via getOrCreate, and this runs for any date
If the resolved timesheet's status = 'submitted' → 403, surfaced inline in the modal, entry not created
- If the resolved week is not the one currently displayed on Home → save succeeds, modal closes, a toast confirms which week it landed in ("Added to week of Sep 1–7"); the entry is not rendered into the currently-visible list

---

### 06 Home Data Wiring

Replace the mock data on Home with real API data.

- GET /api/timesheets/:weekStart for the currently-viewed week — status, week_end, entries, billable total; renders an empty state if no row exists yet for that week
- GET /api/projects — count for the summary card
- Entry list groups the returned entries by date, computes per-day subtotals client-side from already-fetched data (no extra endpoint for this)

---

### 07 Submit Timesheet logic

Wire the submit control.

- POST /api/timesheets/:weekStart/submit — server rejects (400) if the timesheet has zero entries, rejects (409) if already submitted
- On success: status badge flips to "Submitted," existing entry rows render read-only (no edit/delete allowed)

---

## Phase 3 — Timesheet History

### 08 History List Wiring

Wire the (already-built, Feature 04) history list to real data.

- GET /api/timesheets — all rows, status, and an entry count via a join/count in the same query

---

### 09 Timesheet Detail Modal Wiring

Wire the (already-built, Feature 04) detail modal to real data.

- On row click: GET /api/timesheets/:id (or :weekStart, whichever the history payload provides) returning the full entry list for that timesheet plus its stored submitted_at
- edit/delete only allowed if timesheet is not submitted.

---

## Phase 4 — Projects Page

### 10 Projects Page - Full UI

Build the complete Projects page UI with mock data.

- Table: project name, client, total billable hours (mock values)
- "+ Add Project" button opening a modal — name field, client name field

---

### 11 Projects Logic

- GET /api/projects — includes a per-project total billable hours aggregation (sum of time_entry.hours where billable = true, joined via timesheet if needed, grouped by project_id)
- POST /api/projects — name + client_name required; no edit/delete endpoints built

---

## Phase 5 - Tests

### 12 Backend Test Suite

- Week boundary + getWeekEnd unit tests (Feature 03)
- Entry validation: 0 < hours < 20, missing projectId rejected
- getOrCreate reuses an existing week_start row rather than duplicating it, and writes a correct week_end on creation
- Timesheet aggregation totals correct across multiple entries/projects
- Submit rejects zero-entry and duplicate submission
- Edit/delete rejected once the parent timesheet is submitted
- Entry dated into an already-submitted week rejected (403)
- Entry dated into a different, still-draft week succeeds and attaches there, not to the currently-viewed week