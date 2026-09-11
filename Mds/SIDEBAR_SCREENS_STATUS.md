# Sidebar & Screens — Implementation Status

Audit of every screen reachable from the **project sidebar** (`/project/[id]`) and the
**workspace sidebar** (`/dashboard`), scored against `MODULE_CONVENTIONS.md`,
`SUPABASE_CONVENTIONS.md`, `MIGRATION_CONVENTIONS.md` and `crafting.md`.

UI defects found during this audit have already been fixed in code (see
[§7](#7-ui-work-completed-in-this-pass)). Everything below §1–§6 is **pending
non-UI work**: data wiring, persistence, migrations, and permissions.

**Audited at:** commit `1458540`, branch `master`. Migration ledger clean —
25 applied, 0 pending, 0 drifted.

---

## 0. Scorecard

Legend — **Complete**: fetches through the data layer, full CRUD, optimistic +
toasts, three list states. **Partial**: reads real data but a documented gap
remains. **Shell**: renders finished UI over empty in-file constants — no data
layer call anywhere. **Stub**: placeholder only.

### Project sidebar (`components/internal/sidebar/projects/sidebar_data.js`)

| # | Sidebar entry | Screen | Data layer | Migration | State |
|---|---|---|---|---|---|
| 1 | Overview | `overview/project_details.jsx` | ✗ none | n/a | **Shell** |
| 2 | Issues | `issues/workflows.jsx` | `features/issues` | ✓ | **Complete** |
| 3 | Tasks | `tasks/tasks_screen.jsx` | `features/tasks` | ✓ | **Complete** |
| 4 | Work Queue | `work_queue/work_queue_screen.jsx` | `features/tasks` | ✓ | **Partial** |
| 5 | Grounding | `grounding/grounding_screen.jsx` | ✗ not called | ✓ built | **Shell** |
| 6 | Planning | `planning/planning_screen.jsx` | `features/planning` | ✓ | **Partial** |
| 7 | Projections | `projections/projections_screen.jsx` | `features/projections` | ✓ | **Complete** |
| 8 | Milestones | `milestones/milestones_screen.jsx` | `features/milestones` | ✓ | **Complete** |
| 9 | Goals | `goals/goals_screen.jsx` | `features/goals` | ✓ | **Complete** |
| 10 | Reporting | `reporting/reporting_screen.jsx` | tasks + issues + time_entries | ✓ | **Complete** |
| 11 | Objectives | `objectives/objectives_screen.jsx` | `features/objectives` | ✓ | **Complete** |
| 12 | Assets | `assets/assets_screen.jsx` | `features/assets` | ✓ | **Partial** |
| 13 | Office ▸ Recent Files | `office/office_recent_screen.jsx` | ✗ inline queries | ✗ **missing** | **Partial** |
| 14 | Office ▸ Folders | `office/office_folders_screen.jsx` | ✗ inline queries | ✗ **missing** | **Partial** |
| 15 | Office ▸ Shared with Project | `office/office_shared_screen.jsx` | ✗ inline queries | ✗ **missing** | **Partial** |
| 16 | Logs | `logs/logs_screen.jsx` | `features/activity_logs` | ✓ | **Complete** |
| 17 | Team | `team/team.jsx` | ✗ inline queries | ✗ **missing** | **Partial** |
| 18 | Resource Allocation | `resource_allocation/…` | `features/resources` | ✓ | **Complete** |
| 19 | Vault | `vault/vault_screen.jsx` | `features/vault` | ✓ | **Complete** |
| 20 | Externals | `externals/externals_screen.jsx` | `features/external_links` | ✓ | **Complete** |
| 21 | Security | `security/security_screen.jsx` | ✗ not called | ✓ built | **Shell** |
| 22 | Settings ▸ General | `settings/general/…` | ✗ local state | n/a | **Partial** |
| 23 | Settings ▸ Connections | `settings/connections/…` | ✗ none | ✗ | **Stub** |
| 24 | Settings ▸ Customs | `settings/customs/…` | ✗ local state | ✗ **missing** | **Shell** |
| 25 | Settings ▸ Navigation | `settings/navigation/…` | `lib/supabase/nav_prefs` | ✓ (geiger-dash) | **Complete** |
| 26 | Settings ▸ Add-ons | `settings/addons/…` | ✗ local state | ✗ **missing** | **Partial** |
| 27 | Settings ▸ Usage | `settings/usage/…` | ✗ hardcoded zeros | ✗ | **Shell** |
| 28 | Settings ▸ Advanced | `settings/advanced/…` | ✗ local state | ✗ | **Shell** |
| 29 | Settings ▸ Enterprise | `settings/enterprise/…` | ✗ local state | ✗ | **Shell** |

**Orphan:** `settings/connectivity/connectivity_screen.jsx` is not in `settingsNav`
and not referenced by `settings_screen.jsx` — dead code.

### Workspace sidebar (`components/internal/sidebar/sidebar_nav.jsx`)

| Sidebar entry | Screen | Data layer | State |
|---|---|---|---|
| Overview | `dashboard/overview/overview.jsx` | ✗ none | **Shell** |
| Projects | `dashboard/projects/projects.jsx` | `public.projects` | **Complete** |
| Reporting | `reporting/reporting_screen.jsx` | shared with project | **Complete** |
| Inbox | `dashboard/inbox/inbox.jsx` | notifications | **Partial** |
| Team | `dashboard/team/team.jsx` | profiles | **Partial** |
| Roles | `dashboard/roles/roles.jsx` | `localStorage` | **Partial** |
| Usage | `dashboard/usage/usage.jsx` | ✗ hardcoded zeros | **Shell** |
| Billing | `dashboard/billing/billing.jsx` | ✗ none | **Shell** |
| Organization settings | `dashboard/organization_settings/…` | organization | **Partial** |

**Headline:** 11 of 29 project screens are convention-complete. The three
highest-value gaps are **Overview** (the landing screen, zero data), **Security**
and **Grounding** (finished UI + finished data layer + applied migrations that
were never connected to each other).

---

## 1. Screens that are pure shells

These render polished, finished UI on top of empty in-file constants. No user
will ever see content in them.

### 1.1 Overview — `components/internal/screens/projects/overview/project_details.jsx`

The default landing screen for every project. Every widget renders zeros.

| Constant | Line | What it feeds |
|---|---|---|
| `STATUS_SHOWCASE = []` | 151 | Task-breakout donut — renders empty, filter dropdown has zero options |
| `RADAR_METRICS = {}` | 159 | Yearly radar — falls back to `EMPTY_RADAR_DATA` (six zeros) |
| `RESOURCE_METRICS = {}` | 175 | Resource performance radial — no rings |
| `DASHBOARD_TASKS = []` | 182 | unused |
| `DASHBOARD_MILESTONES = []` | 211 | unused |
| `DASHBOARD_ACTIVITY = []` | 213 | unused |

Also hardcoded: the four `MetricCard` values, and the Members / Goals /
Milestones headline counts (now a `StatsBar`, still zeroed).

**Requirement — wire Overview to the data layer.**

1. Fetch on mount from the existing modules — no new migrations needed:
   `listTasks`, `listIssues`, `listGoals`, `listMilestones`, `listActivityLogs`,
   `listAllocations`.
2. Derive every widget with `useMemo` over those rows:
   - `STATUS_SHOWCASE` → group `tasks` by status, using `TASK_STATUS_MAP` from
     `features/tasks/constants.js` for label + colour.
   - `RADAR_METRICS` → issues closed / tasks completed / time logged per month
     over the selected `filterValue` range.
   - `RESOURCE_METRICS` → per-assignee counts from `listAllocations` + tasks.
   - The four `METRIC_CARDS` → real counts + a sparkline series per range.
   - `headlineStats` → member count (§4.2), `goals.length`, `milestones.length`.
3. Honour the range `FilterDropdown` (`1w`/`1m`/…) — it currently changes nothing.
4. Delete the six dead constants and the `EMPTY_RADAR_DATA` fallback once the
   real series land; keep the `EmptyState` path for a genuinely empty project.
5. `DeadlinesSection` (`components/internal/shared/deadlines.jsx`) needs the same
   treatment — verify it reads milestones rather than rendering a placeholder.

**Pace:** 1–1.5 days. Largest single win in the app.

### 1.2 Security — `components/internal/screens/projects/security/security_screen.jsx`

The data layer is **already written and its migration is already applied**. The
screen simply never calls it.

- `features/security/actions.js` (677 lines) exports `listSecurityPolicies`,
  `createSecurityPolicy`, `updateSecurityPolicy`, `softDeleteSecurityPolicy`,
  `listVulnerabilities`, `createVulnerability`, `updateVulnerability`,
  `softDeleteVulnerability`, `listAccessEvents`, `createAccessEvent`,
  `recordAccessEvent`, `listApiKeys`, `createApiKey`, `updateApiKey`,
  `softDeleteApiKey`.
- Migration `20260826122614_security.sql` — applied, batch 3.
- The screen seeds from `POLICIES = []`, `VULNERABILITIES = []`,
  `ACCESS_EVENTS = []`, `API_KEYS = []` (lines 61–67) and holds everything in
  `useState`. Edits vanish on refresh.

**Requirement.** Replace the four seeds with `useState([])` + a `loading` flag,
fetch all four lists in one mount effect, and route the existing create / update /
delete handlers through the actions optimistically (mint `crypto.randomUUID()`
up front, `toast.error` + roll back on a falsy return). Add the loading state the
screen currently lacks. No schema work.

**Pace:** half a day. Pure wiring against an existing, tested surface.

### 1.3 Grounding — `components/internal/screens/projects/grounding/grounding_screen.jsx`

Identical shape to Security.

- `features/grounding/actions.js` (376 lines) exports `listChannels`,
  `createChannel`, `updateChannel`, `softDeleteChannel`, `listMessages`,
  `createMessage`, `updateMessage`, `softDeleteMessage`.
- Migration `20260826122612_grounding.sql` — applied, batch 3.
- The screen seeds from `CHANNELS = []` / `MESSAGES = []` (lines 44–46).

**Requirement.** Fetch channels on mount; fetch messages per selected channel;
persist sends through `createMessage`. Add loading and empty states for both the
channel rail and the message pane. Consider Supabase Realtime on
`flow.grounding_messages` so a second viewer sees new messages — otherwise the
screen needs a manual refresh affordance.

**Pace:** half a day wired; +half a day for realtime.

### 1.4 Settings ▸ Usage, Advanced, Enterprise, Customs

| Screen | Behaviour | Requirement |
|---|---|---|
| `settings/usage/usage_screen.jsx` | Every metric is a literal `"0"`; `databaseRows`/`sessionBreakdown` are `[]` | Needs a usage source. Nothing in the schema records per-project consumption — this is blocked on §5.1. |
| `settings/advanced/advanced_settings.jsx` | 5 `useState(false)` toggles (read-only, maintenance, audit logging, rate limiting, IP restriction) that reset on refresh | Persist into `public.projects.metadata` via a shallow-merge RPC, or promote to columns. |
| `settings/enterprise/enterprise_settings.jsx` | 7 `useState(false)` toggles (SSO, SCIM, retention, encryption…) | Same as Advanced; several imply real backend features that do not exist. Decide per toggle: persist the intent, or hide until the feature ships. |
| `settings/customs/customs_settings.jsx` | `INITIAL_FIELDS = []`, fields live in `useState` | Needs a `flow.custom_fields` table (§5.2) and a `features/custom_fields` module. |

**Pace:** Advanced + Enterprise persistence, half a day (one migration adds a
`settings jsonb` bag to a `flow.project_settings` table plus a merge RPC).
Customs, 1 day. Usage, blocked.

### 1.5 Workspace ▸ Overview, Billing, Usage

Same pattern at the workspace level — `throughputData` zeros, no billing source,
no usage source. Blocked on the same metering decision as §1.4.

---

## 2. Screens bypassing the data layer

`SUPABASE_CONVENTIONS.md` §5: *"One file per area. It is the **only** place that
talks to that area's table."* Three surfaces call `.from()` directly inside the
component.

### 2.1 Office (3 screens)

`office_recent_screen.jsx`, `office_folders_screen.jsx` and
`office_shared_screen.jsx` issue **17 inline `.from()` calls** against
`office_files`, `office_folders` and `office_file_shares`.

Four separate violations:

1. **No data layer.** No `features/office/actions.js` exists.
2. **No migration.** None of the three tables appears in `supabase/migrations/`.
   The schema was created out-of-band — `MIGRATION_CONVENTIONS.md` §0 rule 6:
   *"If it isn't a ledgered migration, it doesn't exist."* A fresh environment
   cannot build these tables, and `db:push` will not reproduce them.
3. **Wrong schema.** They resolve through the default `public` schema, not `flow`.
4. **Hard delete.** `office_recent_screen.jsx:186` and
   `office_folders_screen.jsx` call `.delete()`. The convention is soft delete —
   set `deleted_at`, and filter `deleted_at is null` on read.

**Requirement.**

1. `npm run db:new -- office_files --template table` etc. Create
   `flow.office_files`, `flow.office_folders`, `flow.office_file_shares` with the
   standard column set (`id`, `metadata jsonb`, `created_by uuid`, `created_at`,
   `updated_at`, `deleted_at`) and `project_id uuid references public.projects(id)`.
   If rows already exist in `public`, the migration must copy them across before
   the screens switch over.
2. Add `features/office/actions.js`: `normalizeOfficeFile` / `toRow`,
   `listOfficeFiles`, `listFolders`, `listFolderFiles`, `listSharedFiles`,
   `createOfficeFile`, `updateOfficeFile`, `softDeleteOfficeFile`,
   `createFolder`, `updateFolder`, `softDeleteFolder`, `addFilesToFolder`,
   `shareFile`. Guard every call with `isSupabaseConfigured()`; return
   `null` / `[]` / `false`; never throw, never toast.
3. Rewrite the three screens against it. Replace the bespoke `error` +
   "Try again" block with the conventional loading → empty → filtered-empty
   states, and add the missing `toast` feedback on rename / delete / create
   (all three currently fire and forget).

**Pace:** 1.5–2 days including the data migration.

### 2.2 Team — `components/internal/screens/projects/team/team.jsx`

Reads and writes `public.flow_teams`, storing the entire roster as a **JSONB blob
on one row keyed by project id**.

- No migration for `flow_teams` anywhere in the repo.
- `flow_`-prefixed **and** in `public` — the exact pair
  `MIGRATION_CONVENTIONS.md` §13 lists as retired.
- `saveMembers` (line 124) upserts fire-and-forget: no `await` on the result, no
  error check, no toast, no rollback. A failed write silently diverges the UI
  from the database.
- A blob cannot be indexed, joined to `public.profiles`, or row-secured per
  member.

**Requirement.** New migration creating `flow.project_members` — one row per
member (`project_id`, `user_id uuid`, `email`, `role`, `status`, standard
columns, unique on `(project_id, email)`). Add `features/team/actions.js`
(`listMembers`, `inviteMember`, `updateMemberRole`, `softDeleteMember`), rewrite
the screen optimistically with toasts, and back-fill the existing `flow_teams`
blobs in the same migration.

This table also unblocks the Members KPI on Overview (§1.1) and assignee pickers
that currently read `TEAM_MEMBERS = []` in `tasks/tabs/task_core_tab.jsx:66`.

**Pace:** 1 day.

### 2.3 `lib/supabase/profiles.js` — `public.flow_profiles`

Same prefixed-table-in-`public` violation, and no migration in this repo. If the
table is genuinely suite-shared it belongs in `public.profiles`, owned and
migrated by geiger-dash — confirm the owner and either move it or document the
ownership the way `lib/supabase/nav_prefs.js` already does for
`public.user_nav_prefs`.

**Pace:** half a day, mostly coordination.

### 2.4 `utils/supabase/client.js`

A one-line re-export shim of `lib/supabase/client.js`, kept alive only by the
office screens. Delete it once §2.1 lands and repoint any remaining importers.

**Pace:** minutes.

---

## 3. Partial screens

| Screen | Gap | Requirement | Pace |
|---|---|---|---|
| **Work Queue** | Reads tasks, but has no update or delete path — a queue you cannot act on | Add claim / reassign / complete through `updateTask`, optimistic + toast | 0.5d |
| **Assets** | `create:0`, `delete:0` in the screen although `features/assets` exports `createAsset`, `deleteAsset`, `uploadAsset` | Wire `upload_dialog.jsx` to `uploadAsset` and the row menu to `softDeleteAsset` | 0.5d |
| **Planning** | Board persists via `features/planning`, but `INITIAL_FILES` (line 117) is a static in-file array | Move file attachments onto the board's `metadata` bag or a real table | 0.5d |
| **Settings ▸ General** | `editedProjectName` is local state; nothing writes back to `public.projects` | Persist the rename; toast; reflect into `useProject()` | 0.25d |
| **Settings ▸ Add-ons** | Enable/disable lives in `useState`; every add-on resets on refresh | Persist enabled add-ons + `navPositions` + `addonColors` per (project, user) — the `user_nav_prefs` pattern is the model | 0.5d |
| **Dashboard ▸ Roles** | Roles persist to `localStorage` under `ROLE_STORAGE_KEY` — per-browser, not per-user | Promote to a real table; see §4.1 | 1d |
| **Dashboard ▸ Inbox / Team / Org settings** | Read real data; mutation coverage not verified in this pass | Audit each for create/update/delete + toasts | 0.5d |

---

## 4. Permissions (RBAC)

### 4.1 The project sidebar is entirely ungated

`lib/rbac.js` defines 15 `WORKSPACE_PERMISSIONS`, all of them `view.*` keys for
the **workspace** nav. `roleHasPermission` / `tabPermissionKey` are called in
`components/internal/sidebar/sidebar.jsx`, `app/dashboard/page.js` and
`app/workspace/page.js` — and **nowhere in `project_sidebar.jsx`**.

So none of the 21 project sections (Issues, Vault, Security, Settings…) can be
gated by role. `Settings → Navigation` hides entries, but that is per-user
curation and explicitly *not* an authorization boundary — the hook's own comment
says so.

**Requirement.**

1. Add a `PROJECT_PERMISSIONS` catalog to `lib/rbac.js` — one `view.<tab>` key
   per `projectNav` entry plus the `settingsNav` children, using the existing
   `tabPermissionKey` normalisation.
2. Filter `mergedNav` in `useVisibleProjectNav()` by `roleHasPermission` **before**
   personal visibility is applied, so curation narrows an already-authorized set.
3. Gate `renderScreen()` in `app/project/[id]/page.js` too — a hidden tab is
   still reachable by URL (`?Vault`).
4. Roles must move off `localStorage` first (§3, Dashboard ▸ Roles) or the gate
   is trivially bypassed.

**Pace:** 1 day, after roles are persisted.

### 4.2 `lib/abilities.js` is defined but barely used

The action-ability catalog (`issues.create`, `tasks.delete`, …) is enforced in
the database by `flow.has_ability(project_id, ability)` — but only
`features/security/actions.js` and `security_screen.jsx` reference it. Every
other feature module writes without an ability check, so the UI shows affordances
the database may reject.

Its header comment also points at `supabase/migrations/0003_abilities.sql`, a
path that no longer exists (the file is `20260625023918_abilities.sql`). Fix the
reference.

**Requirement.** Decide whether abilities are the enforcement mechanism. If yes,
add checks to the remaining feature modules and disable the corresponding UI
controls. If no, retire `lib/abilities.js` and the `has_ability` RLS predicate
rather than leaving a half-enforced model.

**Pace:** 1–2 days depending on the decision.

### 4.3 RLS is still demo-open

Every `flow.*` table carries the demo policy
`for all to anon, authenticated using (true)`. Tightening it to a
project/org-scoped policy is a **new migration** per
`MIGRATION_CONVENTIONS.md` §5 — not an edit to the originals. This is the single
largest security item before any non-demo deployment.

**Pace:** 2–3 days, and it depends on §2.2 (`flow.project_members`) existing so a
policy can ask "is this user on this project?".

---

## 5. Missing schema

| # | Needed for | Table(s) | Notes |
|---|---|---|---|
| 5.1 | Settings ▸ Usage, Dashboard ▸ Usage, Dashboard ▸ Billing | usage metering + billing | No source exists. Decide: derive from `flow.activity_logs`, or integrate a metering provider. Blocking three screens. |
| 5.2 | Settings ▸ Customs | `flow.custom_fields` | `{ project_id, entity, key, label, type, options jsonb, required }` |
| 5.3 | Settings ▸ Advanced / Enterprise | `flow.project_settings` | One row per project + a `settings jsonb` bag and a shallow-merge RPC, mirroring the `event_merge_meta` pattern |
| 5.4 | Office (§2.1) | `flow.office_files`, `flow.office_folders`, `flow.office_file_shares` | Currently un-migrated tables in `public` |
| 5.5 | Team (§2.2) | `flow.project_members` | Currently a JSONB blob in `public.flow_teams` |
| 5.6 | Roles (§3) | `flow.workspace_roles` | Currently `localStorage` |
| 5.7 | Add-ons (§3) | per-(project, user) add-on prefs | Model on `public.user_nav_prefs` |

Every one of these must be scaffolded with `npm run db:new`, ship an `@up` and a
mirrored `@down`, be idempotent and schema-qualified, and enable RLS.

---

## 6. Cross-cutting

### 6.1 No list/detail split outside Issues and Tasks

`crafting.md` §4.4 sets the tabbed detail editor as the pattern for per-entity
work. Only `workflows.jsx` and `tasks_screen.jsx` implement it. Goals,
Milestones, Objectives, Vault, Assets, Security, Externals and Logs are
list-plus-dialog only — a dialog cannot hold the tabs (activity, comments,
relations, attachments) those entities want.

**Requirement.** For each: an `?<entity>=<id>` URL param read via the same
mechanism the page already uses for tabs, an early return to a detail component,
and inline-editable fields that persist immediately and lift back to the list.
Start with Goals and Milestones — they have the most per-entity content.

**Pace:** ~0.5d per entity after the first.

### 6.2 Pre-existing React Compiler lint errors

`npx eslint` reports 10 errors in `components/internal/screens/projects/office/`
alone, all `react-hooks/preserve-manual-memoization` or
`react-hooks/set-state-in-effect`. The pattern is
`useCallback(..., [project?.id])` where the compiler infers `project.id`, plus
mount effects that call a setState-ing fetcher directly.

**Requirement.** Destructure `const { id: projectId } = project ?? {}` and depend
on `projectId`; move the fetch out of the effect body (or mark it as the external
sync it is). Fix while rewriting each screen against its new data layer rather
than as a separate pass. `crafting.md` §0 requires eslint clean before a screen
is called done.

**Pace:** folded into §2.1 and §2.2.

### 6.3 Dead code

- `settings/connectivity/connectivity_screen.jsx` — not in `settingsNav`, not
  referenced by `settings_screen.jsx`. Delete it or route it.
- `utils/supabase/client.js` — see §2.4.
- `assets/data.js` — verify it holds only constants, not row data.

### 6.4 `@geiger/ui` upstream

`EditorSectionHeader` in `node_modules/@geiger/ui/src/ui/screen-kit.jsx:55`
renders its title with `text-white` rather than `text-foreground`. Harmless on
the dark theme, wrong under a light one. Fix belongs upstream in the `geiger-ui`
repo, not here.

---

## 7. UI work completed in this pass

All of the following is already applied to the working tree. `npm run build`
passes; `npx eslint` introduces no new errors.

| Area | Change |
|---|---|
| **Project Overview** | Bespoke `<h1>` + badge + inline stat trio replaced with `ScreenHeader` + `StatsBar`. Leftover marketing-copy paragraph removed; the header description now reads `project.description`. Orphan range `FilterDropdown` (floating under a bare divider) promoted to the header action slot. Section titles moved to `EditorSectionHeader`. Bespoke "No issues yet" box replaced with `EmptyState`. Four hand-written `MetricCard` blocks with hardcoded values collapsed to a `METRIC_CARDS` config map. Dead `activeIssueTab` state and 9 unused imports removed. |
| **Project Overview** | "View Issues" was inert — now navigates to the Issues tab via a new `onViewIssues` prop wired in `app/project/[id]/page.js`. |
| **Office** | Bespoke `text-3xl font-bold` header replaced with `ScreenHeader`; redundant `mt-6` wrapper dropped so the screen inherits `MainScreenWrapper`'s rhythm. |
| **Office** | File-type accents (`#4285f4`, `#0f9d58`, `#f4b400`) moved out of inline styles into `iconClass` / `tintClass` / `dotClass` utilities in `lib/office/office-file-meta.js`. The `OFFICE_FILE_TYPE_MAP` and type filter options were duplicated across two screens — now defined once and imported. Starred-file icon `fill-[#f4b400]` → `fill-amber-400`. Folder-swatch selection ring `#fff` → a `ring-foreground` token; the folder tint fallback hex now reads `FOLDER_COLORS[0]`. |
| **Settings shell** | Every tab shared one generic description ("Manage your usage settings for this project"). Added a per-tab `SETTINGS_TAB_META` map. The unknown-tab fallback — a dashed box reading "*X* settings placeholder" — is now an `EmptyState`. |
| **Settings ▸ Usage** | Removed the duplicate page title (the shell already renders `ScreenHeader`, so the screen showed its heading twice). Chart colours `#8b5cf6` / `#e7e7e7` → `var(--chart-4)` / `var(--foreground)`. |
| **Settings ▸ Connections** | Was a bare `div` with copy reading "will load here from the backend"; now matches its siblings — `SectionCard` + `EmptyState` with user-facing copy. |
| **Global banner** | **Bug:** `iconColor: "#e7e7e7"` was passed through `cn()` as a *class name*, emitting the invalid class `#e7e7e7` — the banner icon rendered with no colour at all. Fixed to `text-foreground`. The warning/info hazard-stripe palettes (8 raw hex values in inline gradients) are now tailwind palette utilities. |
| **Dashboard ▸ Overview** | Had no page header. Added `ScreenHeader` with the range filter as its action. The local `EmptyPanel` re-implemented `EmptyState` — now wraps it. Redundant `w-[90%]` wrapper around `MainScreenWrapper` removed, commented-out "Add Activity" block deleted, panel headings moved to `EditorSectionHeader`, chart colour `#8b5cf6` → `var(--chart-4)`, and the two panels' surfaces reconciled (`bg-surface-card` → `bg-surface-subtle`, matching the elevation ladder in `crafting.md` §4.1). |
| **Dashboard ▸ Billing / Integrations** | Hand-rolled headers that duplicated `ScreenHeader`'s markup exactly → `ScreenHeader`. |
| **Dashboard ▸ Usage** | Header was four levels of nested flex wrappers with a description copy-pasted from Settings ("General configuration, privacy, and lifecycle controls"). Flattened into `ScreenHeader` with the period/project selects as actions and accurate copy. Chart colour `#e7e7e7` → `var(--foreground)`. |
| **Planning nodes** | Resize-handle chrome `#474747` / `#333` → `var(--border-strong)` / `var(--border)`. Task-node status colours (`#525252`, `#f59e0b`, `#10b981`, `#ef4444`) → a `STATUS_CLASSES` map of palette utilities. Note-node default accent → `bg-amber-400` (a custom `data.color` still wins). |
| **Projections** | `text-[#60a5fa]` → `text-blue-400`. |
| **Project sidebar** | **Bug:** a group whose child was the active tab auto-expanded, but the first click on it computed `!undefined === true` and re-set it to expanded — so collapsing an auto-opened group needed two clicks. `isGroupExpanded` now resolves the effective state and the toggle inverts *that*. Also removed three unused icon imports, an unused `toggleSidebar`, and two dead `onClick` branches that could never fire in dropdown mode. |

**Deliberate exceptions.** Hex values kept as genuine data, not design tokens:
the per-link colour picker in Externals, the add-on icon palette, `FOLDER_COLORS`
(persisted on the folder row), and the Mastercard brand dots in the billing
dialog.

---

## 8. Suggested order

1. **Security + Grounding wiring** — half a day each, data layer and migrations
   already exist. Fastest visible progress in the app.
2. **`flow.project_members`** (§2.2) — unblocks Overview's member count, task
   assignee pickers, and any project-scoped RLS policy.
3. **Overview data wiring** (§1.1) — the landing screen, and it depends on 1–2.
4. **Office migrations + data layer** (§2.1) — the largest convention debt, and
   it clears most of the outstanding lint errors with it.
5. **Roles off `localStorage`, then project RBAC** (§3, §4.1).
6. **Settings persistence** — `flow.project_settings` + Customs (§5.2, §5.3).
7. **Tighten RLS** (§4.3) — gated on 2 and 5.
8. **Detail editors** for Goals and Milestones (§6.1).
9. **Usage/billing metering** (§5.1) — decide build vs. integrate; three screens
   stay hollow until then.
