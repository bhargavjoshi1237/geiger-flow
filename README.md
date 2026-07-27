<div align="center">

# Geiger Flow

**Plan and track work.**

Projects, issues, tasks, milestones, objectives, and goals — in one fast, opinionated workspace.

Part of the [Geiger](#the-geiger-suite) suite.

</div>

---

## Overview

Geiger Flow is the project and work-tracking application of the Geiger suite. Teams organise work into **projects**, break it down into **issues** and **tasks**, and roll it up into **milestones**, **objectives**, and **goals** — with reporting, planning, and resource views layered on top.

Flow is also the suite's reference implementation. Its data-layer patterns (a dedicated Postgres schema, RLS-enforced project access, a `metadata` expansion bag) and its `components/ui/` primitives are the canonical source for the shared [`@geiger/ui`](https://github.com/bhargavjoshi1237/geiger-ui) library that every other Geiger app consumes.

## Highlights

| Area | What it does |
| --- | --- |
| **Projects** | A project workspace with overview, planning, work queue, team, settings, and a visual builder canvas. |
| **Issues** | Full issue tracking with status, priority, type, estimate, dates, assignees, and threaded comments. |
| **Tasks** | Task lists scoped to a project, sharing the issue lifecycle and ability model. |
| **Milestones** | Dated checkpoints that group issues and tasks into deliverable slices. |
| **Objectives & Goals** | Outcome tracking above the day-to-day backlog, linked back to the work that moves it. |
| **Planning & projections** | Resource allocation, projections, datasets, and grounding views for forward planning. |
| **Reporting** | Cross-project reporting on throughput and delivery. |
| **Organisation** | Team, roles, inbox, usage, billing, and organisation settings at the org level. |
| **Add-ons** | A pluggable add-on registry (system architecture, forms, project-plus, credited resources) that injects its own nav entries and screens. |
| **Access control** | Project access enforced in the database through RLS, keyed on organisation membership and per-project abilities. |

## Tech stack

- **Framework** — Next.js 16 (App Router, SSR/SSG) and React 19
- **Styling** — Tailwind CSS v4 and shadcn/ui, with the shared [`@geiger/ui`](https://github.com/bhargavjoshi1237/geiger-ui) component library
- **Icons** — Lucide
- **Backend** — Supabase (Postgres, Auth) on a dedicated `flow` schema
- **Canvas** — React Flow (`@xyflow/react`) for the project builder
- **Other** — Recharts (reporting), dnd-kit (drag and drop), date-fns

## Getting started

### Prerequisites

- Node.js 20 or later
- A Supabase project with the `flow` schema exposed under **Settings → API → Exposed schemas**

### Installation

```bash
npm install
```

### Environment

Create a `.env` file in the project root:

```bash
# Runtime (browser)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-only
STRING_URI=your-direct-postgres-connection-string   # migrations only
GEIGER_EMAIL_API_URL=your-suite-email-endpoint      # assignment notifications
GEIGER_EMAIL_API_KEY=your-suite-email-key
```

### Database

Numbered, idempotent migrations live in `supabase/migrations/` and run in filename order:

```bash
node scripts/run-sqls.js
```

### Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. In production the app is served under the `/flow` base path behind the suite hub.

## Project structure

```
app/                     Next.js App Router routes
  project/[id]/          Project workspace and builder canvas
  dashboard/             Organisation dashboard
  api/notifications/     Assignment notification endpoints
features/                Per-feature data layer (issues, tasks, milestones, objectives, goals)
  <feature>/actions.js   CRUD + normalize/toRow against the `flow` schema
  <feature>/constants.js Status, priority, and type lookups
addons/                  Pluggable add-on modules and the add-on registry
components/
  internal/screens/      Workspace screens by area
  internal/shared/       Shared screen kit (headers, tables, stats, dialogs)
  ui/                    shadcn primitives (canonical source for @geiger/ui)
supabase/
  components/            flowClient() — the schema-scoped Supabase client
  migrations/            Numbered, idempotent SQL migrations
scripts/run-sqls.js      Migration runner
```

## Conventions

This codebase follows a consistent set of patterns. Read these before contributing:

- [`AGENTS.md`](AGENTS.md) — working notes for this Next.js version
- [`MODULE_CONVENTIONS.md`](MODULE_CONVENTIONS.md) — how to build a workspace screen
- [`SUPABASE_CONVENTIONS.md`](SUPABASE_CONVENTIONS.md) — the data-layer playbook
- [`crafting.md`](crafting.md) — UI craft and quality bar
- [`db.md`](db.md) — table reference

## The Geiger suite

Geiger Flow is one application in the broader Geiger suite, alongside Geiger Events, Geiger Notes, Geiger Forms, and others. Every product shares one Supabase project, a common design language, and the [`@geiger/ui`](https://github.com/bhargavjoshi1237/geiger-ui) component library, so each app feels native to the whole.

## License

Private and unpublished. All rights reserved.
