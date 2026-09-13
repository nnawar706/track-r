# Progress Tracker

Update this file after every completed feature. Keep it short and readable. Any AI agent reading this should immediately know what is done, what is in progress and what is next.

---

## Current Status

**Phase:** Phase 2 — Home Page
**Last Completed:** 04 Home Page - Full UI
**Next:** 05 New Entry Logic

---

## Progress

### Phase 1 - Foundation

- [x] 01 Boilerplate
- [x] 02 Database Schema
- [x] 03 Week/Date Library

### Phase 2 - Home Page

- [x] 04 Home Page - Full UI
- [ ] 05 New Entry Logic
- [ ] 06 Home Data Wiring
- [ ] 07 Submit Timesheet Logic

### Phase 3 - Timesheet History

- [ ] 08 History List Wiring
- [ ] 09 Timesheet Detail Modal Wiring

### Phase 4 - Projects Page

- [ ] 10 Projects Page - Full UI
- [ ] 11 Projects Logic

### Phase 5 - Tests

- [ ] 12 Backend Test Suite

--- 

## Decisions Made During Build

- **shadcn is set up via the CLI's `-b radix -p nova` ("radix-nova") preset** — `npx shadcn@4.21.0 init -t vite -b radix -p nova`. Components use the `radix-ui` meta-package (`import { Slot } from "radix-ui"`, `Slot.Root`), the `cn` package (not a hand-rolled `lib/utils.ts` helper — `utils.ts` just re-exports it), `class-variance-authority`, and `tw-animate-css`; `src/index.css` imports `shadcn/tailwind.css` for the preset's utility layer (scroll-fade, shimmer, data-state variants, etc.).
- **Known Windows bug in shadcn CLI ≤4.21.0: it writes generated files to a literal `./@/...` folder instead of resolving the `@/` alias to `src/`** (confirmed via a patched debug build: its internal workspace-consistency check naively `path.resolve`s the alias string against a mix of `/`-separated alias text and `\`-separated OS paths, so `@/components` never gets substituted with `src/components`). `init`/`add` still work and produce correct file *contents* — after running either command, manually move whatever lands in `./@/...` into the matching path under `src/`, then delete the stray `@` folder. Do this every time a new primitive is added (Card, Table, Dialog, Input, Select, Badge, Skeleton) until an upstream fix lands.
- The preset's `init` also defaults to a grayscale oklch palette, a full `.dark` block, and the Geist variable font (`@fontsource-variable/geist`) — all removed/remapped to match ui-context.md (blue/white palette in `src/index.css`'s `:root` + `@theme inline`, no dark mode, system font stack). Re-apply this remap if `init` is ever re-run.
- Tailwind v4 is wired via `@tailwindcss/vite` (no `tailwind.config.ts`); CSS variables for the blue/white palette live in `src/index.css` under `:root` + `@theme inline`, per ui-context.md's "define colors in index.css" rule.
- `client/tsconfig.app.json` and `vite.config.ts` both define the `@/*` → `./src/*` alias.
- Server's `dotenv.config()` now points at `.env.local` (was defaulting to `.env`) to match code-standards.md's env-var convention; `server/.env.local` holds `PORT`.
- `server/db/connection.js` reads `DB_PATH` from env with a default of `server/db/app.db`, and sets `PRAGMA foreign_keys = ON` on every connection.
- `server/db/schema.sql` holds the three `CREATE TABLE IF NOT EXISTS` statements from architecture.md (the `IF NOT EXISTS` is an addition for idempotent startup, not a schema change). `connection.js` executes it and then calls `db/seed.js`'s `seed(db)` on every connection open — `seed()` no-ops once `project` has any rows, so it only inserts the 2 mock projects ("Website Redesign" / Acme Corp, "Mobile App" / Globex Inc) on a fresh database. Verified: schema creates all 3 tables, FK and UNIQUE(project_id, date) constraints reject bad inserts, and re-running doesn't duplicate the seed.
- `server/lib/week.js` and `client/src/lib/week.ts` are independent, timezone-safe implementations (dates parsed/formatted via UTC getters/setters to avoid local-timezone day shifts) — both expose `getWeekStart`/`getWeekEnd`; the client also exports `isWeekend` for disabling Saturday/Sunday in the date picker. `getWeekStart` treats Sunday as belonging to the *preceding* Monday (not the next week) per project-overview.md's success criteria. Tests in `server/__tests__/week.test.js` (run via `npm test` → `node --test`, no extra test framework needed) cover the Monday–Friday case, Saturday/Sunday boundary, a year-boundary week, and `getWeekEnd` being exactly 4 days after `getWeekStart` — all 8 pass. The client version was verified against the same cases via `node --experimental-strip-types` and via `tsc -b` (strict mode, no errors).
- **Feature 04 (Home Page — Full UI) built with mock data only, no API calls.** Added shadcn primitives via `npx shadcn@4.21.0 add card table dialog input label select badge skeleton checkbox switch textarea` (same Windows `./@/...` bug as before — moved generated files into `src/components/ui/` manually, no new npm dependencies pulled in since everything routes through the existing `radix-ui` meta-package). Installed `react-router-dom@7` (already an approved dependency, needed for project-overview.md's two routes) and added a minimal `pages/Projects.tsx` placeholder so the Navbar's Projects link resolves — the real Projects UI is still Feature 10, this placeholder is routing plumbing only.
- New components: `components/Navbar.tsx` (not in architecture.md's original file list, but required by ui-context.md's global nav spec — Dashboard/Projects links + "New Entry" button), `components/StatusBadge.tsx` (small shared Draft/Submitted badge — Draft uses shadcn's `secondary` badge styling equivalent i.e. muted bg/foreground text, Submitted uses a custom `bg-primary/10 text-primary` combo since no built-in shadcn badge variant matches ui-context.md's "light blue tint" spec), plus the architecture-listed `SummaryCards`, `EntryList`, `NewEntryModal`, `TimesheetHistoryList`, `TimesheetDetailModal`.
- `lib/week.ts` gained one addition: `addDays(date, days)`, reusing the file's existing private `parseDateOnly`/`formatDateOnly` helpers — needed by `EntryList` (grouping the week into Mon–Fri) and by `App.tsx`'s mock data generation. Existing Feature 03 functions/tests untouched. Added `lib/formatWeekRange.ts` (pure, no dependencies) shared by `TimesheetHistoryList`, `TimesheetDetailModal`, and `Home.tsx`'s heading.
- `NewEntryModal` does double duty as the edit form too (`editingEntry` prop): reused rather than building a second modal, since project-overview.md's rule "when editing an entry, user cannot edit the date" is the only real difference — the date input is just disabled and the "use last used project" checkbox is hidden in edit mode. Both create and edit currently mutate local mock state in `App.tsx`; real API wiring is Feature 05/06.
- Mock "backend" state (projects, current-week entries, timesheet history + details) lives in `App.tsx` as the single lifted state owner, since the Navbar's "New Entry" button (global, per ui-context.md) and `Home.tsx`'s current-week view both need to share it. This will be replaced by real fetched state in Feature 06.
- Verified via `tsc -b` (no errors), `npm run build` (succeeds), and a Playwright-driven screenshot pass against the Vite dev server: summary cards, day-grouped entry table with per-day/weekly totals, timesheet history list, the New Entry modal (including the weekend-date validation message firing correctly), and the Timesheet Detail modal all render as expected.