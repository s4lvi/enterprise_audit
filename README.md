# Enterprise Audit

A web app for auditing chapter enterprises across our business-development organization.
Tracks feasibility, progress, and chapter capability; provides table, map, and
relationship-graph views.

See [PLAN.md](./PLAN.md) for the phased build plan and architecture.

## Status

Pre-alpha — under active initial setup.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Supabase (Postgres/Auth) ·
Vercel · GitHub Actions · pnpm.

## Getting started

> Setup instructions will fill in as phases land. For now: read `PLAN.md`.

```bash
nvm use            # Node 22 LTS (see .nvmrc)
pnpm install       # once package.json exists (Phase 1)
pnpm dev           # local dev server
```

## Conventions

- Conventional commits (e.g. `feat:`, `fix:`, `chore:`, `docs:`) — keeps history scannable.
- One concern per PR; CI must be green to merge.
- Secrets live in `.env.local` (never committed) and Vercel env vars.
