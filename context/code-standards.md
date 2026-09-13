# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is everything** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap server operations in try/catch, log failures, never let one failure crash everything

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary

---

## File and Folder Naming

- Folders: kebab-case
- Component files: PascalCase
- Utility files: camelCase
- Type files: camelCase
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared
- No inline styles — all styling via Tailwind classes using CSS variables from ui-context.md

---

## Error Handling

- Never use empty catch blocks — always log or handle
- Console errors always include context prefix: `[component/function name]`
- User-facing errors must be human readable — never expose raw error messages
- API route errors return `status: 500` with generic message — never expose internals

---

## Environment Variables

All environment variables defined in `.env.local` for development. Never hardcode any key, URL, or secret anywhere in the codebase.

---

## Import Aliases

In the client folder, always use the `@/` alias — never use relative imports that go up more than one level.

```typescript
// Correct
import { Button } from "@/components/ui/button";

// Never
import { Button } from "../../../components/ui/button";
```

---

## Forms and Validation

- Use Zod for validation. All user input must be validated.
- Server-side validation is always required. Never trust client-side validation.

---

## API Route Standards

- Do not expose internal errors, stack traces, API keys, database errors, or provider-specific secrets to the client.

---

## Database Standards

- All db queries execute on the server
- Use meaningful model and field names.
- Define relationships explicitly.
- Use database constraints where appropriate.

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious decision
- Never leave TODO comments in committed code

---

## Dependencies

Do not install packages casually.

Before adding a dependency, check:

- Does React already provide the functionality?
- Does shadcn/ui already provide the component?
- Can the requirement be implemented simply with existing dependencies?
- Does the dependency solve a genuine project requirement?

If a new dependency is necessary:
- Explain why it is required.
- Confirm it does not duplicate existing functionality.
- Add it to the approved dependency list in this document.
- Update project documentation if the architecture changes.

Approved dependencies for this project:

- react/vite
- react-router-dom
- typescript
- tailwindcss
- shadcn/ui (CLI preset: `-b radix -p nova`) — brings in `radix-ui`, `cn`, `class-variance-authority`, `tw-animate-css`, and `shadcn` itself as a runtime import (`shadcn/tailwind.css` utilities)
- lucide-react
- sqlite
- zod
- testing dependencies as introduced during the testing phase

Do not install any other packages without updating this list first.