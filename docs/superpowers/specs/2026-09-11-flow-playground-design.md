# Flow Playground on `/` — Design

**Date:** 2026-09-11
**Status:** Approved, ready to implement

## Goal

The `/` landing page embeds a live, browsable, **read-only** copy of the Flow
project workspace — the real `ProjectSidebar`, `ProjectTopbar`, and all project
screens and Settings tabs — running on static frontend fixtures, with no session
and no Supabase.

This mirrors how geiger-events shows its own product on its `/` page, but with
Flow's own screens rather than a clone of Events' page.

## Decisions

| Question | Decision |
|---|---|
| Where demo data enters | The data boundary (`createClient()`), not per-screen |
| Surface covered | Project level only (`/project/[projectId]` shell and its screens) |
| Interactivity | Strictly read-only — nothing pretends to save |
| Demo content | One realistic demo project with mutually-consistent rows |

## Architecture

### 1. The demo data boundary

`lib/supabase/client.js`'s `createClient()` returns a fixture-backed demo client
when demo mode is on. Because `flowClient()` is defined as
`createClient().schema("flow")`, this one interception covers both the `flow`
schema (19 feature modules) and the `public` schema (`projects`,
`flow_profiles`, `flow_workspace_roles`, `user_nav_prefs`).

A useful side effect: the landing page renders even when
`NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` are absent, since `createBrowserClient` is
never constructed in demo mode.

New modules under `supabase/demo/`:

- **`demo-mode.js`** — module-level flag (`isDemoMode` / `setDemoMode`).
  Renders of the playground subtree are preceded by the flag being set, so no
  child's mount effect can race it.
- **`fixtures.js`** — one demo project (*Apollo Platform Redesign*) and its rows
  across the `flow.*` tables, plus `public.projects` and `flow_profiles`. Stable
  hard-coded UUIDs so cross-references hold: an issue's assignee is a real
  profile row, a milestone's `metadata.tasks` reference real task titles, and
  every row carries the demo `project_id` and `organization_id`.
- **`demo-store.js`** — the fixtures indexed by table, plus the `rpc` result map.
- **`demo-client.js`** — a PostgREST-shaped builder. Reads resolve from the
  store; writes are rejected. Any chain the builder does not understand calls
  `assertSupported()` (a `console.error`) and resolves empty, so a gap surfaces
  loudly instead of silently rendering an empty screen.

Methods the builder must implement (measured across `features/`,
`lib/supabase/`, `context/`, and the screens):

```
from, select, insert, update, upsert, delete,
eq, in, is, filter, or,
order (incl. nullsFirst), limit,
single, maybeSingle, rpc, schema
```

Plus the non-query surface the app touches: `auth.getUser`, `auth.getSession`,
`channel`/`removeChannel` (realtime), and `storage.from().getPublicUrl()`.

Writes resolve to an error (not a silent success) so the read-only path is
honest.

### 2. Shell extraction

The screen `switch` in `app/project/[id]/page.js` moves into
`components/internal/screens/projects/resolve_project_screen.jsx`, so the real
route and the playground share one source of truth. `page.js` keeps its
behaviour and calls the extracted resolver.

This is the piece that gives the playground "all screens" for free, and keeps
them correct as screens are added.

### 3. The playground shell

New files under `components/landing/playground/`:

- **`flow_playground.jsx`** — the shell: `ProjectTopbar` + `ProjectSidebar` +
  resolver + error boundary. `h-full` rather than `h-[100dvh]`, screens
  `dynamic()`-loaded so the landing page stays light.
- **`playground_project_provider.jsx`** — a `ProjectProvider` substitute serving
  the static fixture project. Bypasses the UUID gate in
  `context/project-context.js` and carries a real `organization_id`, which
  Tasks, Issues, Work Queue and Reporting need via `listOrgMembers`.
- **`playground_url_provider.jsx`** — in-memory `activeTab` stand-in for the
  `?Issues` query param, mirroring the existing pattern in
  `app/workspace/page.js`.
- **`read_only_context.jsx`** — `useReadOnlyDemo()` for disabling mutating
  affordances as each screen is polished.
- **`screen_error_boundary.jsx`** — per-tab boundary so one broken screen cannot
  take the landing page down.

Provider composition: `ProjectBudgetProvider` is retained (already fully
static). `AddonRegistryProvider` is retained with `DEFAULT_ENABLED_ADDONS`
forced empty, which drops the second React Flow canvas that
`system-architecture` would otherwise mount. `NavVisibilityProvider` is
**omitted** — `@geiger/ui`'s `ALL_VISIBLE` fallback renders the full sidebar
without a session. Cost: Settings → Navigation becomes a no-op writer.

`components/landing/flow_playground_showcase.jsx` wraps the shell as a landing
section, and `app/page.js` renders it below the existing kanban hero
(`workspace_showcase.jsx` stays as-is).

### 4. Read-only enforcement

- The demo client rejects every write. The playground catches that and shows one
  uniform, playground-owned *"This is a read-only demo"* toast, so a rejection
  is never mistaken for a bug. This is uniform and costs zero screen changes.
- Per-screen disabling of create/drag/delete controls via `useReadOnlyDemo()` is
  incremental polish, not a correctness requirement.
- Hard-blocked because they leave the sandbox: Assets upload (Storage), Team
  invite (email), Issues `notifyIssueAssigned` (API route), Grounding's realtime
  subscription, Planning's autosave timers.
- Neutralised: the topbar logo's `window.location.href = "/"` and `Next/Link`s
  pointing at `/org`, which would otherwise eject a visitor from the embed.

## Staging

- **Phase 1** — boundary, shell extraction, playground shell, landing wiring,
  and verification of the highest-value screens: Overview, Issues, Tasks,
  Milestones, Goals, Objectives, Team, Assets.
- **Phase 2** — Work Queue, Reporting, Grounding, Projections, Resource
  Allocation, Vault, Logs, Security, Externals, Settings tabs.
- **Phase 3** — Planning, Office, and the context-coupled Settings tabs
  (Navigation, Add-ons).

## Open items

- **Planning** is the heaviest item on a public page (React Flow plus ~40
  sub-files). Loaded lazily like every other screen, accepting the chunk; a
  static image would be cheaper but dead.
- **Office** was expected to need refactoring onto the action layer to be
  reachable by the boundary. It does not: `@/utils/supabase/client` re-exports
  `createClient`, so Office is already covered. Refactoring it onto
  `features/office/actions.js` remains a valid conventions cleanup but is not a
  prerequisite.
- **No build** until Phase 1 lands; verify in the dev server first, per
  `CLAUDE.md`.
