# Crafting Guide — Building High-Quality Interactive Modules

This is the playbook for taking a feature from "basic CRUD" to a polished,
fully-interactive module that feels native to the suite. The **issues module**
is the reference build — when in doubt, open these files and copy the pattern:

- Data layer: `features/issues/actions.js`, `features/issues/constants.js`
- Screen + detail sheet: `components/internal/screens/projects/issues/workflows.jsx`
- Create/edit dialog: `components/internal/dilouges/issues/newissue_dilouge.jsx`
- Shared list row: `components/ui/issue-item.jsx`
- People/profiles: `lib/supabase/profiles.js`, `lib/supabase/user.js`
- Schema: `supabase/migrations/0001_issues.sql`, `0003_abilities.sql`,
  `0005_issues_metadata.sql`

Read `MODULE_CONVENTIONS.md` first — this guide layers craft and UX on top of
those structural rules; it does not replace them.

---

## 0. The quality bar

A feature is "done" when **every interaction a user expects already works** and
looks like the rest of the suite. Concretely:

- Nothing is read-only that a user would reasonably want to change. Status,
  priority, dates, labels, assignees, comments — all editable in place.
- Every list has loading, empty, and "no results for these filters" states.
- Every async action gives feedback (toast) and updates the UI optimistically.
- Colours are semantic tokens only — never hardcoded hex.
- Dropdowns/popovers visibly stand out from the surface behind them.
- Reuse existing components and helpers before writing new ones.
- `npx eslint <changed files>` is clean before you call it done.

Scale effort to the request, but for anything described as "proper", "complete",
"interactable", or "fancy", deliver the full set above — don't ship a stub.

---

## 1. Workflow (how we worked)

1. **Explore before touching anything.** Read the target module *and* the
   reference module (issues/tasks) so new code matches existing naming, file
   layout, and idioms. Use a search agent for breadth.
2. **Plan briefly, then implement.** State a short ordered plan, then build it in
   one pass per file. Don't over-ask; pick the obvious option and note it.
3. **Edit in small, exact diffs.** Match the surrounding code's comment density
   and style. Keep imports tidy — remove an import the moment it's unused.
4. **Lint after each meaningful change:** `npx eslint <files>`. Treat unused
   imports/vars as errors to fix immediately.
5. **Migrations are explicit.** Add the SQL file, but only run
   `node scripts/run-sqls.js` when the user asks (it hits the live DB). Make the
   UI **degrade gracefully** before the migration runs (default values on read).
6. **Respect user/linter edits.** If a file changed under you, re-read it and
   build on top — don't revert intentional tweaks.

---

## 2. Data layer pattern (`features/<module>/actions.js`)

Mirror the issues actions exactly:

- **Talk to the DB only through `flowClient()`** (a `.schema("flow")` client).
  Use the base `createClient()` only when you need `auth.getUser()`.
- **Map at the boundary.** DB is snake_case; UI is camelCase. Provide
  `normalize<Thing>(row)` (→ view model) and an internal `toRow(input)`
  (→ columns). The screen only ever sees camelCase view models.
- **`toRow` must support partial patches** so inline edits work:
  emit a column only when its key is present in `input`. This lets one
  `update<Thing>(id, patch)` serve both full-form saves and single-field inline
  edits (`{ status }`, `{ priority }`, `{ assignees }`…).
- **Never throw, never toast here.** Validate, `console.error("[flow.<x>] …")`
  on failure, and return `null` / `false` / `[]`. The screen decides UX.
- **Standard surface:** `list*`, `create*`, `update*`, `softDelete*`
  (soft delete sets `deleted_at`; lists filter `deleted_at is null`). Add
  child-entity actions (e.g. comments: `list/add/update/delete`) as needed.

## 3. The `metadata` expansion bag

Every product table carries `metadata jsonb not null default '{}'`. Use it to add
fields **without a migration**:

- List the bag's keys (`const METADATA_FIELDS = ["type", "estimate", …]`).
- `normalize*` spreads the bag's keys onto the view model as first-class fields.
- `toRow` folds them back into `row.metadata` **as a whole object** when any bag
  key is present. Because the bag is written whole, inline edits of a single bag
  field must send the full current set — see `patchMeta` in `workflows.jsx`:

  ```js
  const patchMeta = (partial) =>
    patchIssue({ type: issue.type, estimate: issue.estimate,
                 startDate: issue.startDate, ...partial });
  ```

- Promote a bag field to a real column once it needs indexing/constraints/RLS.
- Child/append-only tables (e.g. `*_comments`) don't need the bag.

## 4. Permissions

Authorization is enforced in Postgres via RLS (`flow.has_ability`); JS `can()` is
advisory UI-gating only. Don't invent role plumbing for a feature that's an
"open module" — but never rely on hiding UI for security.

---

## 5. UI craft

### 5.1 Colour & elevation hierarchy (the #1 polish lever)

Dark theme surfaces, lightest→darkest is **not** intuitive — check before
choosing. The trap we hit: dialogs/sheets and `SelectContent` both default to
`surface-dialog`, so dropdowns vanished into the panel. The rule that fixed it:

- **Shell** (dialog/sheet root): `bg-background` (the app canvas).
- **Fields / inner cards** (`Input`, `SelectTrigger`, section cards):
  `bg-surface-card` — slightly elevated above the shell.
- **Popovers / dropdowns** (`SelectContent`, `PopoverContent`): leave the default
  `bg-surface-dialog`, which now reads *lighter* than the shell and pops.
- Headers/footers/tab bars: a translucent wash like `bg-surface-subtle/40`.
- Insets that should recede: `bg-black/20`.

Always use **semantic tokens**: `bg-background`,
`bg-surface-subtle|card|hover|active|strong|dialog`, `text-foreground`,
`text-muted-foreground`, `text-secondary`, `text-tertiary`, `border-border`,
`border-border-strong`, `bg-primary`/`text-primary-foreground`. Status/severity
badges use tailwind colours at `/10` bg + `/20` border + `-400` text.

### 5.2 Reuse before you build

Before writing anything visual, check for an existing piece:

- **Status / severity glyphs:** `statusIcons`, `severityIcons`,
  `IssueSeverityBadge` exported from `components/ui/issue-item.jsx`.
- **Avatars:** `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`,
  `AvatarGroupCount` from `components/ui/avatar.jsx`.
- **People:** `lib/supabase/profiles.js` — `getProfilesByIds(ids)` (map),
  `listOrgMembers(orgId)` (array), `profileFromUser(user)`, `profilePfpUrl(id)`,
  `profileInitials(name)`. Current user via `getUser()` (`lib/supabase/user.js`).
- **Primitives:** prefer `@/components/ui/*` (shadcn) + Lucide icons.

When a constant (status/priority/type/estimate) needs both a label and an icon,
put the value/label list + colour-class `*Meta` maps in
`features/<module>/constants.js`, and keep the React icon map in the component
(e.g. `TYPE_ICONS`). Constants stay plain data; components own JSX.

### 5.3 Screen anatomy (list view)

`workflows.jsx → WorkflowsScreen` is the template:

- Header: title + primary action (Create) in a `NewIssueDialog`.
- **Toolbar:** search input (filters title+description), `Select` filters
  (status, priority), and a sort `Select`. Compute `visibleIssues` with a single
  `useMemo` over (search, filters, sort).
- **List:** map to the shared row component. Three states: loading, empty
  ("create your first…"), and filtered-empty (with a "Clear filters" action).
- Resolve people once at the screen level (org members → id→profile map) and pass
  resolved view-models down; don't fetch per-row.
- Keep list + detail in sync via lifted `onUpdate(updated)` / `onDelete(id)`
  callbacks that patch the screen's array. Removing a row unmounts its detail
  sheet automatically.

### 5.4 Detail sheet anatomy (the interactive surface)

The right-side sheet (`IssueCaseDetails`) is where editing happens:

- **Header:** id chip (mono, with `#`), a colour-tinted **type-icon tile** beside
  the title, an "Opened …" line, edit/delete actions, and a row of indicator
  **pills** (status w/ glyph, priority badge, type, estimate, overdue).
- **Tabs:** Details / Comments (show counts in the tab label).
- **Details = inline-editable property panel.** Each property is a labelled
  control that persists immediately:
  - `Select` for status/priority/type/estimate (options carry icons).
  - date `Input`s for start/due (due shows an "Overdue" treatment when past).
  - Persist via `patchIssue(patch)` (columns) or `patchMeta(partial)` (bag).
- **A compact stat strip** for read-only metadata (created/updated/id): one
  rounded `bg-black/20` panel, equal flex tiles, inset `w-px` dividers between
  them (not edge-to-edge `divide-x`).
- Edit opens the same dialog in controlled mode; delete uses a confirm `Dialog`.

### 5.5 Interaction recipes

**Inline-persist select** — change writes through immediately and lifts up:

```jsx
<Select value={issue.status} onValueChange={(v) => patchIssue({ status: v })}>
  <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {ISSUE_STATUSES.map((s) => (
      <SelectItem key={s.value} value={s.value}>
        <span className="flex items-center gap-2">{statusIcons[s.value]}{s.label}</span>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

In the sidebar, make every dropdown `w-full` so it fills its column.

**Tag input** (labels) — a real boxed field, click-anywhere-to-focus, Enter/comma
to add, Backspace to remove last, × per chip, and commit a half-typed value on
blur/submit. Use a `min-h-[48px]` container with `cursor-text` + a `ref` focused
on `onMouseDown`, not a thin `Input`. See the labels box in both the dialog and
the sheet.

**Member / assignee picker** — `Popover` with a search `Input` and a scrollable,
toggleable member list (avatar + name + check). Selected members render as
removable avatar chips. Source members with `listOrgMembers(project.organization_id)`;
write ids back with `patchIssue({ assignees: ids })`. See `AssigneeSection`.

**Avatar group** in list rows — show up to 3 assignee avatars with `AvatarGroup`,
then a `+N` `AvatarGroupCount`. Image first, gradient-initials fallback.

**Collapsible long text** (description) — no "Show more" button. Clamp with
`max-h` + `overflow-hidden`, lay a `bg-gradient-to-t from-background … to-transparent`
fade over the bottom, make the whole block `cursor-pointer` and toggle expand on
click.

**People in comments** — resolve author ids with `getProfilesByIds`, fall back to
the signed-in user's `profileFromUser(getUser())`, then to a generic "Member" +
"M" avatar. Render real `Avatar` (photo → initials fallback) + name +
relative time. Composer supports ⌘/Ctrl+Enter to submit.

### 5.6 Feedback, states, a11y

- Toasts via Sonner (`toast.success`/`toast.error`) from the screen, never the
  data layer. The Toaster is global with `richColors` and **no close button** —
  don't re-add one.
- Every list/async surface shows loading + empty states. Buttons show a spinner
  and disable while pending.
- Defer effect `setState` with `void Promise.resolve().then(...)` to satisfy the
  hooks lint rule.
- Icon-only buttons get `aria-label`; decorative dividers are `pointer-events-none`.

---

## 6. New / upgraded module checklist

1. **Schema:** `supabase/migrations/NNNN_<module>.sql` — table in `flow`,
   indexes, `updated_at` trigger, RLS, and a `metadata jsonb` bag. Graceful
   read defaults so the UI works pre-migration.
2. **Data layer:** `actions.js` (`flowClient`, `normalize*`/`toRow`, partial
   patch, metadata fold, child actions) + `constants.js` (value/label lists,
   `*Meta` colour maps, sort options).
3. **List screen:** search + filters + sort, three list states, lifted
   update/delete, people resolved once at screen level.
4. **Detail surface:** inline-editable properties, tag inputs, pickers, stat
   strip, comments with real authors, collapsible text.
5. **Create/edit dialog:** one reusable component (create + controlled edit),
   `bg-background` shell, icon-bearing selects, tag input.
6. **Reuse + tokens:** existing components/helpers, semantic colours only,
   correct elevation hierarchy.
7. **Lint clean** (`npx eslint`), then tell the user what (if anything) they need
   to run (e.g. the migration).

If you follow this, the result will look and feel like the issues module — which
is the bar for this codebase.
