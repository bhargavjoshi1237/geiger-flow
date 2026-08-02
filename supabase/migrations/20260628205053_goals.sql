-- Imported from 0009_goals.sql by geiger-orm.
-- No @down section — this migration cannot be rolled back.

-- @up
-- Goals module
-- Lives in the dedicated `flow` product schema. A goal is project-scoped and may
-- optionally belong to an objective (objective_id) — the Objectives kanban shows
-- the goals of one objective, while the Goals screen shows top-level goals
-- (objective_id is null). Fully idempotent and self-contained.
--
-- Depends on 0008_objectives.sql (flow.objectives), 0001_issues.sql
-- (flow.set_updated_at), 0003/0004 abilities (flow.has_ability + open_module).

create extension if not exists pgcrypto;
create schema if not exists flow;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists flow.goals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  objective_id uuid references flow.objectives(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'not_started',
  owner text,
  progress integer not null default 0,
  target_date date,
  -- Ordering within a kanban column (objective view). Lower comes first.
  position integer not null default 0,
  -- Expansion bag: keyResults[], progressSource, trackMetric, target,
  -- targetValue live here (see MODULE_CONVENTIONS.md -> metadata).
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.goals to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists goals_project_idx
  on flow.goals (project_id, status, target_date);

create index if not exists goals_objective_idx
  on flow.goals (objective_id, position);

-- ---------------------------------------------------------------------------
-- updated_at trigger (reuses flow.set_updated_at from 0001_issues.sql)
-- ---------------------------------------------------------------------------

drop trigger if exists goals_set_updated_at on flow.goals;
create trigger goals_set_updated_at
  before update on flow.goals
  for each row execute function flow.set_updated_at();

-- ---------------------------------------------------------------------------
-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).
-- ---------------------------------------------------------------------------

insert into flow.open_module (module) values ('goals')
  on conflict (module) do nothing;

-- ---------------------------------------------------------------------------
-- Row level security — ability-scoped, one policy per action.
-- ---------------------------------------------------------------------------

alter table flow.goals enable row level security;

drop policy if exists goals_select on flow.goals;
create policy goals_select on flow.goals
  for select using (flow.has_ability(project_id, 'goals.view'));

drop policy if exists goals_insert on flow.goals;
create policy goals_insert on flow.goals
  for insert with check (flow.has_ability(project_id, 'goals.create'));

drop policy if exists goals_update on flow.goals;
create policy goals_update on flow.goals
  for update
  using (flow.has_ability(project_id, 'goals.update'))
  with check (flow.has_ability(project_id, 'goals.update'));

drop policy if exists goals_delete on flow.goals;
create policy goals_delete on flow.goals
  for delete using (flow.has_ability(project_id, 'goals.delete'));
