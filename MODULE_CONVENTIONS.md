# Module Conventions (DB ↔ Feature)

How to build a project feature module (DB, data layer, permissions, UI) so it
matches the rest of the app. Reference implementation: **issues** and **tasks**
(`features/issues`, `features/tasks`, `supabase/migrations`).

## Where things go

| Concern | Location | Naming |
|---|---|---|
| SQL schema/policies | `supabase/migrations/NNNN_<name>.sql` | zero-padded, sequential |
| Reusable Supabase helpers | `supabase/components/*.js` | `flow-client.js` etc. |
| Data layer (interaction) | `features/<module>/actions.js` | one file per module |
| Module constants/labels | `features/<module>/constants.js` | status/priority maps |
| Ability catalog | `lib/abilities.js` | shared, single source |
| Screens | `components/internal/screens/projects/<module>/` | `*_screen.jsx` |
| Dialogs | `components/internal/dilouges/<area>/` | `*_dilouge.jsx` |

Files use snake_case names; React components are PascalCase; ability/permission
keys are dot-namespaced (`issues.create`). All imports use the `@/` root alias.

## Database & migrations

- One concern per migration, **idempotent** and **self-contained**: `create … if
  not exists`, `create or replace function`, and `drop policy if exists` before
  `create policy`.
- All product tables live in the **`flow` schema** (`flow.issues`, `flow.tasks`),
  not `public`. Shared/canonical tables (`public.projects`, `auth.users`,
  `public.organization_users`) are referenced directly.
- Reuse the shared trigger `flow.set_updated_at()` (created in `0001`) for any
  `updated_at` column.
- **Every product table carries a `metadata jsonb not null default '{}'::jsonb`
  expansion column.** Store new, not-yet-promoted attributes there so the feature
  can grow without a migration; promote a field to a real column once it needs
  indexing, constraints, or RLS. The data layer spreads the bag's keys onto the
  view model (and folds them back on write) so the UI treats them like first-class
  fields. (Issues: `metadata` holds `type`, `estimate`, `startDate` — see
  `0005_issues_metadata.sql`. Child/append-only tables like `issue_comments` don't
  need it.)
- Run with `node scripts/run-sqls.js` — it executes every
  `supabase/migrations/*.sql` in filename order. Add a feature → drop in the next
  `NNNN_*.sql` and re-run.
- The `flow` schema must stay in the API's **exposed schemas** (already set via the
  `authenticator` role). Without it, `.schema("flow")` returns `PGRST106`.

## Data interaction layer (`features/<module>/actions.js`)

- Talk to the DB **only** through the shared `flowClient()` from
  `@/supabase/components/flow-client` (a `.schema("flow")` browser client). Use a
  base `createClient()` only when you also need `auth.getUser()` (`.schema()`
  clients have no `.auth`).
- Keep actions **pure data access**: validate inputs, `console.error("[flow.<x>] …")`
  on failure, and **return `null`/`false`/`[]`** — never throw, never `toast` here.
- The DB is snake_case; the UI is camelCase. Map at this boundary (`toRow` /
  `normalizeTask`) and return view-model objects the screen renders directly.
- Standard surface: `list*`, `create*`, `update*`, `softDelete*` (soft delete sets
  `deleted_at`; list filters `deleted_at is null`).
- The **screen** decides UX: it calls actions and shows `toast.success` /
  `toast.error` based on the return value.

## Permissions (abilities)

Authorization is **enforced in PostgreSQL via RLS** — JS is advisory only.

- Actions are classified as dot-namespaced **abilities** (`issues.create`).
  Catalog them in `lib/abilities.js` (`ABILITIES`, `ACTION_ABILITIES`).
- RLS uses **one policy per action**, each calling
  `flow.has_ability(project_id, '<module>.<action>')`.
- `flow.has_ability` resolves the caller's project role (`flow.project_role`),
  then: owners → all; **open modules** (rows in `flow.open_module`, mirrored by
  `OPEN_MODULES` in `lib/abilities.js`) → all members; otherwise an explicit grant
  in `flow.role_ability (organization_id, role_key, ability)` is required.
- To open a module to everyone now: insert into `flow.open_module` + add to
  `OPEN_MODULES`. To lock it down later: remove both and seed `flow.role_ability`.
- `can(ability, { role, grants })` in `lib/abilities.js` mirrors the DB for
  hiding/disabling UI only. It does **not** secure anything.

## UI conventions

- **Components:** prefer `shadcn/ui` primitives (`@/components/ui/*`) and **Lucide**
  icons. Match the geiger-notes suite look.
- **Dialogs:** `bg-surface-dialog`, `p-0 gap-0`, icon + title header with
  `border-b`, body, `border-t` footer with ghost Cancel + primary action. Keep the
  default close button. Multi-section detail uses the **tab bar** pattern
  (`flex-1 py-3 border-b-2`, active `border-primary text-foreground bg-surface-hover/30`).
- **Feedback:** Sonner `toast` (Toaster is global, `richColors`, **no close
  button** — don't re-add it).
- **State:** loading + empty states on every list. Defer `setState` in effects
  (`void Promise.resolve().then(...)`) to satisfy the React hooks lint rule.
- **Colors — use semantic tokens only, never hardcode hex:**
  - Surfaces: `bg-background`, `bg-surface-subtle|card|hover|active|strong|dialog`
  - Text: `text-foreground`, `text-muted-foreground`, `text-secondary`, `text-tertiary`
  - Borders: `border-border`, `border-border-strong`
  - Brand/primary: `bg-primary` + `text-primary-foreground`
  - Destructive: `text-red-400` / `focus:bg-red-500/10` (delete actions)
  - Status/severity badges: tailwind color utilities at `/10` bg + `/20` border.

## New-module checklist

1. `supabase/migrations/NNNN_<module>.sql` — table in `flow`, indexes, `updated_at`
   trigger, RLS (membership or ability-scoped). Run `node scripts/run-sqls.js`.
2. (If gated) add abilities to `lib/abilities.js`; add RLS policies per action; open
   the module via `flow.open_module` or seed `flow.role_ability`.
3. `features/<module>/{actions.js,constants.js}` using `flowClient()`.
4. Screen + dialog under the folders above; wire fetch/create/update/delete with
   toasts; reuse existing UI primitives and color tokens.
