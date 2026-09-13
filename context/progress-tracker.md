# Progress Tracker

Update this file after every completed feature. Keep it short and readable. Any AI agent reading this should immediately know what is done, what is in progress and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last Completed:** 01 Boilerplate
**Next:** 02 Database Schema

---

## Progress

### Phase 1 - Foundation

- [x] 01 Boilerplate
- [ ] 02 Database Schema
- [ ] 03 Week/Date Library

### Phase 2 - Home Page

- [ ] 04 Home Page - Full UI
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