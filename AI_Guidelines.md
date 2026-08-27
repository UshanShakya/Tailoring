# AI Guidelines — How Work Should Be Done On This Project

These rules apply to any AI assistant (or human) writing code for this
project. They exist to keep the codebase consistent, secure, and easy to
resume across sessions.

## 1. Before writing any code

- Read `Progress_Tracker.md` to see current state.
- Read `Tasks.md` to find the current milestone and the specific task.
- Read `Architecture.md` for the relevant folder/module conventions.
- Do **not** work on a task outside the current milestone unless the user
  explicitly asks for it. Flag scope creep instead of silently doing it.

## 2. Tenant isolation — the most important rule

- Every table that isn't `Business` itself or a global template must carry
  `businessId`.
- Every database query for a business-scoped model **must** filter by
  `businessId` derived from the authenticated user's token — never from a
  client-supplied value.
- Use the tenant-scoped Prisma wrapper (see `Architecture.md`) for all
  business-scoped reads/writes. Do not call `prisma.customer.findMany()`
  etc. directly in route handlers — go through the scoped client so it's
  structurally impossible to forget the filter.
- Super Admin routes are the only place a `businessId` may come from the
  request itself (e.g. `/admin/businesses/:id`), and only Super Admin role
  can hit those routes.

## 3. Role & permission checks

- Every route handler must declare the permission it requires and run it
  through the shared `authorize(permission)` middleware — never check
  `req.user.role` ad hoc inside a handler.
- Frontend permission hooks (`usePermission(...)`) are for UX only (hiding
  buttons). They are never the actual security boundary — the backend must
  independently enforce every check.

## 4. Code style & conventions

- TypeScript everywhere, `strict: true`. No `any` unless truly
  unavoidable, and comment why when used.
- Naming: `camelCase` for variables/functions, `PascalCase` for
  components/types/classes, `kebab-case` for file names except React
  components (`PascalCase.tsx`).
- Prefer small, single-responsibility functions and modules over large
  files. If a file exceeds ~250 lines, consider splitting it.
- Validate all external input (API request bodies, query params) with Zod
  schemas before touching business logic.
- Handle errors explicitly — no empty `catch` blocks. Return structured
  error responses: `{ error: { code, message } }`.
- Write comments to explain *why*, not *what* — the code should already
  say what it does.

## 5. Database changes

- All schema changes go through Prisma migrations, never manual SQL
  against the dev/prod database.
- Never change a system-default template/garment-type row in a way that
  could affect other businesses — customizations must clone into a
  business-scoped row.

## 6. Git & task hygiene

- Track changes using Git locally (User: `ushan.shakya`, Email: `usnshakya4@gmail.com`). No remote push required unless requested.
- Create a dedicated git commit after completing each milestone:
  - Command: `git add .`
  - Commit message format: `[Milestone X] Short description of completed milestone`
- After completing a task, update `Progress_Tracker.md` immediately —
  move the item from "In Progress" to "Done," and note the next item as
  "In Progress" or leave it "Not Started" if pausing.
- Do not mark a milestone complete in the tracker until every task under
  it in `Tasks.md` is done and (if applicable) manually verified.

## 7. UI work

- Never use a raw hex/rgb color in a component. Only Tailwind classes
  mapped to the design tokens defined in `UIUX.md`.
- If a new color need arises, add it as a token in `UIUX.md` and the
  Tailwind config first — don't inline it.

## 8. When unsure

- If a requirement is ambiguous, make the most reasonable assumption,
  state it clearly in the PR/response, and proceed — don't block progress
  waiting for clarification unless the ambiguity could cause rework across
  multiple milestones.
- Never silently expand scope. If you think something should be added
  beyond what `Tasks.md` describes, say so explicitly rather than just
  building it.

## 9. Completion Documentation Requirement

- After completing each milestone, always create a dedicated walkthrough file in the root `walkthrough/` directory named `walkthrough/Milestone_X_Walkthrough.md` (e.g. `walkthrough/Milestone_1_Walkthrough.md`), detailing:
  - What was built / changed.
  - Why it was changed.
  - Test credentials and API endpoints.
  - Step-by-step instructions on how to test and run it.
- Update `Progress_Tracker.md` continuously so the user can easily review and test.
