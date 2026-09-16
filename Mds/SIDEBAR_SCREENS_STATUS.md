# Sidebar & Screens — Implementation Status

Audit of every screen reachable from the **project sidebar** (`/project/[id]`),
scored against `MODULE_CONVENTIONS.md`, `SUPABASE_CONVENTIONS.md`,
`MIGRATION_CONVENTIONS.md` and `crafting.md`.

**Audited at:** commit `6305520`+, branch `master`.
Migration ledger clean — **40 applied, 0 pending, 0 drifted**.
`next build` clean. `npx eslint .` — **0 errors**, 11 warnings.

> The previous revision of this file was pinned to commit `1458540` and scored
> Overview, Grounding and Security as shells and Connections as a stub. All four
> have since been wired; it also documented a `/workspace` sidebar that no longer
> exists. Treat any copy of that table as void.

---

## 0. Scorecard

Legend — **Complete**: fetches through the data layer, full CRUD, optimistic +
toasts, three list states. **Partial**: reads real data but a documented gap
remains.

Every entry below resolves to a real screen in
`components/internal/screens/projects/resolve_project_screen.jsx`. There is no
"coming soon" fallback anywhere in the project shell, and no screen seeds itself
from a static in-file array.

| # | Sidebar entry | Screen | Data layer | State |
|---|---|---|---|---|
| 1 | Overview | `overview/project_details.jsx` | `tasks`, `issues`, `goals`, `milestones`, `activity_logs`, `resources`, `team` | **Complete** |
| 2 | Issues | `issues/workflows.jsx` | `features/issues` | **Complete** |
| 3 | Tasks | `tasks/tasks_screen.jsx` | `features/tasks` | **Complete** |
| 4 | Work Queue | `work_queue/work_queue_screen.jsx` | `features/tasks` | **Complete** |
| 5 | Grounding | `grounding/grounding_screen.jsx` | `features/grounding/chat_*` | **Complete** |
| 6 | Planning | `planning/planning_screen.jsx` | `features/planning` | **Partial** |
| 7 | Projections | `projections/projections_screen.jsx` | `features/projections` | **Complete** |
| 8 | Milestones | `milestones/milestones_screen.jsx` | `features/milestones` | **Complete** |
| 9 | Goals | `goals/goals_screen.jsx` | `features/goals` | **Complete** |
| 10 | Reporting | `reporting/reporting_screen.jsx` | tasks + issues + time_entries | **Complete** |
| 11 | Objectives | `objectives/objectives_screen.jsx` | `features/objectives`, `features/goals` | **Complete** |
| 12 | Assets | `assets/assets_screen.jsx` | `features/assets` | **Complete** |
| 13 | Office ▸ Recent / Folders / Shared | `office/office_screen.jsx` | `features/office` | **Complete** |
| 14 | Logs | `logs/logs_screen.jsx` | `features/activity_logs` | **Complete** |
| 15 | Team | `team/team.jsx` | `features/team` | **Complete** |
| 16 | Resource Allocation | `resource_allocation/…` | `features/resources` | **Complete** |
| 17 | Vault | `vault/vault_screen.jsx` | `features/vault` | **Complete** |
| 18 | Externals | `externals/externals_screen.jsx` | `features/external_links` (via shell props) | **Complete** |
| 19 | Security | `security/security_screen.jsx` | `features/security` | **Complete** |
| 20 | Settings | `settings/settings_screen.jsx` | see below | **Complete** |

### Settings sub-tabs

| Tab | Screen | Data layer |
|---|---|---|
| General | `settings/general/general_settings.jsx` | `lib/supabase/client` |
| Connections | `settings/connections/connections_screen.jsx` | `features/project_integrations` |
| Customs | `settings/customs/customs_settings.jsx` | `features/custom_fields` |
| Navigation | `settings/navigation/navigation_settings.jsx` | `@geiger/ui` `NavVisibilitySettings` |
| Add-ons | `settings/addons/addons_settings.jsx` | `features/project_settings` |
| Usage | `settings/usage/usage_screen.jsx` | `tasks`, `issues`, `assets`, `activity_logs`, `time_entries` |
| Advanced | `settings/advanced/advanced_settings.jsx` | `features/project_settings` |
| Enterprise | `settings/enterprise/enterprise_settings.jsx` | `features/project_settings`, `features/activity_logs` |

**Externals** is the one screen with no data-layer import of its own: its rows,
loading flag and mutation handlers are owned by the project shell
(`app/project/[id]/page.js`, via `features/external_links`) and passed down as
props, because the same links also feed the sidebar.

---

## 1. Grounding — the chat workspace

Grounding is no longer a channel list. Commit `6305520` ported the whole of
Geiger Chat into it, scoped to a project rather than an organisation.

- **Screens** — `grounding/screens/` maps the rail in `grounding/nav.js` to
  Messages, Channels, Contacts, Calls, Files, Inbox and Settings.
- **Data layer** — `features/grounding/chat_*.js`, one module per concern
  (conversations, messages, threads, calls, call signalling, scheduled calls,
  files, notifications, profiles, storage, scope).
- **Schema** — `flow.chat_*`, created by
  `supabase/migrations/20260915182652_chat_workspace.sql`, which also migrates
  the legacy `flow.grounding_channels` / `flow.grounding_messages` rows into the
  new model. **The legacy tables are still in place and are scheduled for
  removal one release after `6305520`** — that drop is a new migration, not an
  edit to this one.
- **Calls** — WebRTC mesh in `lib/chat/use-call.js`; signalling rides Supabase
  broadcast (`chat_call_signaling.js`), never the database.
- **Standalone** — the same screen runs full-window at `/chat/[id]`; the
  Grounding tab's pop-out button links there.

Set `NEXT_PUBLIC_TURN_URL` (plus `_USERNAME` / `_CREDENTIAL`) to add a TURN relay.
Without it, calls fall back to STUN only and will fail for the ~10–15% of users
behind symmetric NAT.

---

## 2. Known gaps

### 2.1 Planning — **Partial**

The largest screen in the app (72 files, ~9.7k lines) and the only one still
carrying vendored-feeling internals. It persists through `features/planning`, but
the `notes/` subtree keeps its own conventions — its own dialogs rather than the
shared kit, and colour-picker palettes as literal hex (legitimate, since the hex
*is* the data the user picks).

### 2.2 Advisory-only chat affordances

`chat/conversation-row-menu.jsx` — **Mute notifications** and **Archive
conversation** toast success without persisting anything. Both need a per-member
flag on `flow.chat_members` before they can mean anything. Pin, mark-as-read,
leave, channel settings and view-members are all wired.

### 2.3 `flow.chat_notifications` has no writer

The Inbox screen reads the table and the rail badges the unread count, but
nothing inserts rows. Today "unread" comes from
`lib/chat/use-unread-notifier.js`, which is realtime-only by design — it counts
what arrived while the tab was in the background and deliberately does not
backfill from history. A durable inbox needs a writer (a trigger on
`flow.chat_messages`, or an insert alongside each send).

### 2.4 Lint warnings (11, none blocking)

Ten are `@next/next/no-img-element` on images that are genuinely unsuited to
`next/image` — `blob:`/`data:` sources inside the notes canvas, and remote avatar
URLs that would need `images.remotePatterns` entries first. One is a pre-existing
`react-hooks/exhaustive-deps` on a `useCallback` in `ImageCropDialog.jsx`.

---

## 3. Conventions worth restating

- **Addons load from one place.** `addons/index.js` side-effect-imports all five;
  both hosts that render project screens (`app/project/[id]/page.js` and
  `components/landing/playground/flow_playground.jsx`) import that module, so the
  registry can never be populated in one and empty in the other.
- **No static seed arrays.** Screens start `useState([])` + a loading flag and
  fetch on mount. `constants.js` holds `*_MAP` lookups and formatters only.
- **Semantic colour tokens only.** No hardcoded hex in UI chrome; the exceptions
  are user-chosen colour values stored as data.
- **Schema changes are migrations.** `npm run db:new`, never hand-named, never
  edited once pushed. Demo rows are seeds.
