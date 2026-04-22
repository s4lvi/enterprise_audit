# Enterprise Audit — Project Plan

A web app to audit business-development chapters' enterprises/ventures: track
feasibility, progress, and chapter capability; enter data via forms; explore via
searchable tables, a map, and a relationship graph.

## Goals

1. One source of truth for chapters, members, enterprises, and audits.
2. Low-friction data entry for auditors in the field (mobile-usable forms).
3. Multiple views over the same data: table, map, relationship graph.
4. Role-based access — chapter members see their own; auditors/admins see all.
5. A CI/CD setup that catches mistakes before prod and deploys on merge.

## Non-goals (for v1)

- Billing, invoicing, or financial ledgers.
- Real-time collaborative editing.
- Mobile app (web-responsive only).
- Offline-first / PWA. Can revisit if auditors need it.

## Tech stack

| Layer          | Choice                                | Why                                                      |
| -------------- | ------------------------------------- | -------------------------------------------------------- |
| Framework      | Next.js 15 (App Router) + TypeScript  | Requested; server components keep DB queries server-side |
| Styling        | Tailwind CSS + shadcn/ui              | Fast to build, accessible primitives                     |
| DB / Auth      | Supabase (Postgres, Auth, Storage)    | Requested; RLS enforces access at the DB                 |
| Forms          | react-hook-form + zod                 | Type-safe validation shared between client and server    |
| Tables         | TanStack Table                        | Headless, URL-persisted filters/sort                     |
| Map            | MapLibre GL via react-map-gl          | Free, no API token required to start                     |
| Graph          | React Flow                            | Purpose-built for relationship graphs                    |
| Deploy         | Vercel                                | First-class Next.js; branch previews out of the box      |
| CI             | GitHub Actions                        | Requested                                                |
| Package manager| pnpm                                  | Fast, disk-efficient, good monorepo story if we grow     |

## Data model (first draft — will refine in Phase 2)

- **chapters** — `id, name, city, region, lat, lng, notes, created_at`
- **profiles** — `id (= auth.users.id), display_name, role, chapter_id`
  - roles: `admin | auditor | chapter_exec | member`
- **enterprises** — `id, chapter_id, name, description, category, stage,
  lat, lng, founded_on, created_by, created_at`
  - stages: `idea | validating | building | launched | scaling | paused`
- **enterprise_members** — `enterprise_id, profile_id, role` (many-to-many)
- **audits** — `id, enterprise_id, auditor_id, audited_on,
  feasibility_score, progress_score, capability_score, summary`
  - scores: 1–5 integers, plus a free-text summary
- **audit_criteria** — `id, audit_id, dimension, criterion, score, comment`
  - optional granular rubric underneath each top-level score
- **enterprise_relationships** — `from_id, to_id, type, notes`
  - types: `partner | supplier | customer | competitor | parent | spinoff`

Every table has `created_at`, and RLS policies are written in SQL migrations,
not the app. Chapter-scoped rows are readable by that chapter's members;
auditors and admins read everything; writes follow role.

## Phases

Each phase ends in a runnable state and a commit. We walk through each one
together — I explain, you run the commands, we review, we move on.

### Phase 0 — Repo foundations

- `.gitignore`, `.editorconfig`, `README.md` skeleton.
- Node version pinned via `.nvmrc` (Node 20 LTS).
- pnpm installed; `package.json` initialized.
- Conventional-commits note in README (keeps history readable).

**Exit:** `git log` shows the plan and a foundations commit. Repo pushed to
GitHub (you create the remote; I'll walk you through linking it).

### Phase 1 — Next.js scaffold

- `pnpm create next-app` with App Router, TS, Tailwind, ESLint.
- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`).
- Prettier + ESLint config; lint-staged + husky pre-commit hook.
- `pnpm dev` loads a placeholder home page.

**Exit:** Local dev server runs; `pnpm lint && pnpm typecheck` both pass.

### Phase 2 — Supabase project & schema

- Create Supabase project (free tier) in the dashboard.
- Install Supabase CLI; `supabase init` and `supabase link`.
- Write first migration defining the tables above.
- Enable RLS on every table; write starter policies.
- Generate typed DB types (`supabase gen types typescript`) into `src/db/types.ts`.
- Seed script with a couple of fake chapters and enterprises.

**Exit:** `supabase db reset` applies cleanly locally; types regenerate.

### Phase 3 — Auth

- Supabase Auth configured for magic links (email).
- Server + browser Supabase clients (`@supabase/ssr`).
- Login page, logout, protected routes via middleware.
- On first sign-in, create a `profiles` row via DB trigger.

**Exit:** You can log in on a deployed preview with a magic link and land on
a page that greets you by name.

### Phase 4 — CI pipeline (GitHub Actions)

- `.github/workflows/ci.yml`: install, lint, typecheck, test, build.
- Supabase migration dry-run against a throwaway Postgres service container.
- Required-status-check protection on `main` (configured in GitHub UI).

**Exit:** A PR runs CI; green required for merge.

### Phase 5 — CD (Vercel)

- Link the GitHub repo in Vercel; connect `main` → production.
- Env vars in Vercel for Supabase URL + anon key + service role key (server only).
- Preview deployments for every PR automatically.
- Add a tiny smoke test (playwright or a curl in CI) that hits the preview URL.

**Exit:** PR merges → prod deploys automatically; preview URL on every PR.

### Phase 6 — Data layer + forms

- Zod schemas per entity in `src/lib/schemas.ts`.
- Server actions for create/update/delete, each calling Supabase with the
  session-scoped client so RLS applies.
- Forms for chapters and enterprises first, then audits.
- Optimistic UI for create on the tables.

**Exit:** You can add a chapter, add an enterprise to it, and record an audit.

### Phase 7 — Table views

- `/chapters`, `/enterprises`, `/audits` index pages.
- TanStack Table with column filters, global search, sort, pagination.
- Filter state persisted in URL search params so links are shareable.
- Row click → detail page.

**Exit:** Each list is searchable and filterable; details are linkable.

### Phase 8 — Map view

- `/map` page with MapLibre + OSM tiles.
- Markers per enterprise (clustered at low zoom).
- Hover card: name, chapter, stage, latest audit scores.
- Click → enterprise detail.
- Filter sidebar re-uses the table filters.

**Exit:** Map shows every enterprise with usable hover info.

### Phase 9 — Relationship graph

- `/graph` page using React Flow.
- Nodes = enterprises, edges = `enterprise_relationships` with edge labels by type.
- Layout: dagre or elk for an initial arrangement; drag to reposition.
- Click node → enterprise detail.

**Exit:** Graph renders relationships; adding a relationship via form updates the graph.

### Phase 10 — Roles & RLS hardening

- Review every policy against a matrix: (role × table × action).
- Add tests: a script that logs in as each role and confirms reads/writes
  succeed or fail as expected.
- Audit log table for sensitive writes (deletes, role changes).

**Exit:** A non-admin cannot read another chapter's data, proven by automated test.

### Phase 11 — Polish

- Loading skeletons, empty states, error boundaries.
- Keyboard shortcuts on tables (j/k, /, enter).
- A11y pass: landmarks, focus rings, aria labels on icon buttons.
- README finalized: setup, deploy, troubleshooting.
- Lighthouse pass on the three main views.

**Exit:** v1 release tagged.

## Environments & secrets

- **Local**: `.env.local` with Supabase local keys (from `supabase start`).
- **Preview**: Vercel preview env connected to a shared "staging" Supabase project.
- **Production**: Vercel prod env connected to the "prod" Supabase project.
- Service role key lives only in Vercel env (server-side usage); never in client code.

## Open questions to resolve as we go

1. Do members self-register, or are they invited by their chapter exec?
2. What granularity of audit rubric does the org already use? (drives `audit_criteria`)
3. Are there multiple concurrent audits per enterprise, or one rolling record?
4. How are chapters created — admin-only, or can anyone request one?
5. Do we need photo/document uploads on enterprises or audits? (drives Supabase Storage work)

We'll answer these in context; no need to nail them down before starting.

## How we work through this

For each phase, I'll:

1. Explain what we're doing and why.
2. Give you the exact commands/files to run or create.
3. Wait while you do it and share output.
4. Review together, troubleshoot, commit.
5. Move to the next phase.

If you want to skip ahead, speed up, or slow down any part, just say.
