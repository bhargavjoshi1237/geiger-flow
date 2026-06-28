-- Objectives module
-- Lives in the dedicated `flow` product schema. References the canonical shared
-- tables (public.projects, auth.users) directly. Fully idempotent and
-- self-contained.
--
-- Depends on 0001_issues.sql (flow schema + flow.set_updated_at),
-- 0003_abilities.sql (flow.has_ability) and 0004_tasks_abilities.sql
-- (flow.open_module). Authorization follows the open-module model: while
-- 'objectives' is listed in flow.open_module every project member can act.

create extension if not exists pgcrypto;
create schema if not exists flow;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists flow.objectives (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'not_started',
  owner text,
  progress integer not null default 0,
  start_date date,
  target_date date,
  -- Expansion bag: keyResults[] and the kanban `columns` config live here until
  -- they need indexing/constraints (see MODULE_CONVENTIONS.md -> metadata).
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.objectives to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists objectives_project_idx
  on flow.objectives (project_id, status, target_date);

-- ---------------------------------------------------------------------------
-- updated_at trigger (reuses flow.set_updated_at from 0001_issues.sql)
-- ---------------------------------------------------------------------------

drop trigger if exists objectives_set_updated_at on flow.objectives;
create trigger objectives_set_updated_at
  before update on flow.objectives
  for each row execute function flow.set_updated_at();

-- ---------------------------------------------------------------------------
-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).
-- ---------------------------------------------------------------------------

insert into flow.open_module (module) values ('objectives')
  on conflict (module) do nothing;

-- ---------------------------------------------------------------------------
-- Row level security — ability-scoped, one policy per action.
-- ---------------------------------------------------------------------------

alter table flow.objectives enable row level security;

drop policy if exists objectives_select on flow.objectives;
create policy objectives_select on flow.objectives
  for select using (flow.has_ability(project_id, 'objectives.view'));

drop policy if exists objectives_insert on flow.objectives;
create policy objectives_insert on flow.objectives
  for insert with check (flow.has_ability(project_id, 'objectives.create'));

drop policy if exists objectives_update on flow.objectives;
create policy objectives_update on flow.objectives
  for update
  using (flow.has_ability(project_id, 'objectives.update'))
  with check (flow.has_ability(project_id, 'objectives.update'));

drop policy if exists objectives_delete on flow.objectives;
create policy objectives_delete on flow.objectives
  for delete using (flow.has_ability(project_id, 'objectives.delete'));
