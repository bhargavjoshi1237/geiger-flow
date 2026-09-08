# Build Queue — Incomplete Specs & Market-Research Gaps

Source: incomplete spec audit (2026-08-26) against `Mds/*.md`,
`MODULE_CONVENTIONS.md`, `SUPABASE_CONVENTIONS.md`, `MIGRATION_CONVENTIONS.md`,
and `Mds/GEIGER_FLOW_ENTERPRISE_PM_FEATURE_RESEARCH.md`.

Each shipped item followed the conventions end-to-end:
migration (`flow.*`, ability-scoped RLS, @up/@down, open_module) →
data layer (`features/<area>/actions.js` via `flowClient()`, normalize/toRow,
soft delete, tri-state returns) → abilities catalog (`lib/abilities.js`) →
screen (fetch on mount, loading/empty states, optimistic mutations, toast on
failure).

## Shipped (2026-08-26)

| # | Feature | Research priority | Was | Now |
|---|---|---|---|---|
| 1 | Risk Register | P0 | Static addon screen, `riskRows = []` | `flow.risks` (migration 20260825222713), `features/risks`, live register: add/edit dialog, inline status change, delete, exposure metrics, filters |
| 2 | Decision Log | P1 | Static addon screen, `decisions = []` | `flow.decisions` (20260825222732), `features/decisions`, live log: add/edit, stage transitions, delete, age metrics |
| 3 | Time tracking & timesheets | P0 | Absent | `flow.time_entries` (20260825222733), `features/time_entries`, live Time tab in Reporting: log-time dialog, weekly rollups, billable split |
| 4 | Live reporting | P0 | Empty rows, hardcoded pulse | ReportingScreen derives rows/pulse/workload from real tasks, issues and time entries; Tasks / Workload / Time views all live |
| 5 | Work Queue | — | Mock shell (`TASKS = []`) | Live queue over real tasks ordered by due date then priority; live summary cards, status filter chips, Add Work wired through AddTaskDialog → createTask |
| 6 | Vault | — | In-memory only, lost on reload | `flow.vault_items` (20260825224329), `features/vault`; secrets + access setup persist via metadata bag |
| 7 | External links | — | localStorage only per project | `flow.external_links` (20260825224528), `features/external_links`; topbar + Externals screen read/write Supabase |

Migrations pushed with `npm run db:push` (batches 1–2), ledger clean per
`npm run db:status`. `npm run build` and lint pass on all touched files.

## Deferred (needs product decisions beyond current scope)

These remain mock/UI-shell surfaces. Each needs a schema + UX decision before it
can ship cleanly (per MODULE_CONVENTIONS "ask before you build"):

- **Audit/activity Logs** — needs a `flow.activity_log` table plus an append
  helper instrumented across *all* data layers (tasks/issues/milestones/...),
  not just new ones. Half-instrumenting would make the log misleading.
- **Projections, Grounding, Resource Allocation, Security, Datasets, Assets** —
  empty shells needing their own entity models (events, channels, allocations,
  policies/media).
- **Project-plus remaining screens** (Release Readiness, Feedback Hub,
  Experiment Tracker, Incident Center) — same pattern as risks/decisions when
  prioritized.
- **Customs fields, Usage settings, dashboard overview/usage/billing** — need a
  settings/metrics persistence model.
- Research-doc P0s not yet started: portfolio rollups, capacity planning,
  approval workflows, demand intake, dependency graph/critical path.
