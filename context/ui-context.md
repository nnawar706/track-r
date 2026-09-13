# UI Context

## Design Direction

Minimalist. Function over decoration. Generous whitespace, no gradients, no shadows beyond shadcn's defaults, no decorative icons.

## Component Library

**shadcn/ui**, used as-is. No custom theme layer beyond the color overrides below. Prefer existing shadcn primitives over hand-rolled components:

- `Card` — the four summary cards on `/`
- `Table` — entry lists, timesheet history, projects list
- `Dialog` — new-entry modal, timesheet-detail modal
- `Button` — primary (Submit, Save Entry, Add Project) and secondary/ghost (Cancel, row actions)
- `Input` / `Label` — form fields (date, hours, note)
- `Select` — project picker, billable/non-billable toggle
- `Badge` — status indicator (Draft / Submitted)
- `Skeleton` — loading state for tables/cards, if time allows

Don't build a custom modal, table, or form component — if shadcn doesn't have it, reconsider whether the feature needs it before reaching for custom.

## Color Palette

Blue and white only. No secondary accent color.

| Token | Value | Use |
|---|---|---|
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#0f172a` (slate-900) | Primary text |
| `--primary` | `#2563eb` (blue-600) | Primary buttons, links, active states |
| `--primary-foreground` | `#ffffff` | Text on primary buttons |
| `--muted` | `#f1f5f9` (slate-100) | Card backgrounds, table stripe, subtle fills |
| `--muted-foreground` | `#64748b` (slate-500) | Secondary text, labels, captions |
| `--border` | `#e2e8f0` (slate-200) | Card/table/input borders |
| `--destructive` | `#dc2626` (red-600) | Delete actions, validation errors only |

Status badge colors (the one place beyond pure blue/white):
- **Draft** → `--muted` background, `--foreground` text
- **Submitted** → `--primary` background (light tint, e.g. blue-50), `--primary` text

## Typography

System font stack (shadcn default) or a single sans-serif (e.g. Inter). One size scale — don't introduce a display font or a second typeface. Headings: semibold, not bold; body: regular.

## Layout

- Page max-width: 1440px, centered
- Main content area padding: 32px on all sides
- Gap between page sections: 24px
- Header height: 64px, full width, white background, padding 0 24px
- All pages use top navbar only — no sidebar, no drawer

---

## Navbar

Two nav items: Dashboard, Projects with a button to add new entry.

- Active item: `color: #2563eb`, font-weight 500, 14px
- Inactive item: `color: #4A5565`, font-weight 500, 14px
- No underline — active state is color change only
- Navbar always white background, full viewport width

---

## Cards

Every content section lives in a card.

```
background: #FFFFFF
border: 1px solid #E7EAF3
border-radius: 16px
padding: 24px
box-shadow: 0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)
```

Never use colored card backgrounds — always white. Color goes inside cards via badges, bars, and text, never on the card surface itself.

---

## Form Inputs

```
background: #FFFFFF
border: 1px solid #E7EAF3
border-radius: 8px
padding: 8px 12px
font-size: 14px
color: #101828
placeholder color: #99A1AF
focus: ring-1 ring-accent border-accent
```

---

## Table

- No alternating row colors — white rows only, separated by border
- Row border: `1px solid #E7EAF3` between rows
- Column headers: uppercase, 12px, font-weight 500, color `#6A7282`
- Row text: 14px, color `#101828`
- Hover state: `background: #F9FAFB`

## Do Nots

- Never define colors in `tailwind.config.ts` — use `@theme` in index.css
- No custom color outside the palette above
- Never add gradients to card backgrounds
- Never use more than one font weight in a single UI element
- Never show raw error messages to users — always show human readable text
- Never stack more than 2 levels of border radius inside each other
- Never use `position: fixed` for UI elements — use normal flow layout
- No dark mode toggle, no theme switcher — one theme only
- No animation beyond shadcn's built-in transitions