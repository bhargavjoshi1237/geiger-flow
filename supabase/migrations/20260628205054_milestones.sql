-- Imported from 0010_milestones.sql by geiger-orm.
-- No @down section — this migration cannot be rolled back.

-- @up
-- Milestones module
-- Lives in the dedicated `flow` product schema. A milestone groups a set of
-- delivery tasks; its status and completion are derived in the UI from those
-- tasks. Fully idempotent and self-contained.
--
-- Depends on 0001_issues.sql (flow.set_updated_at), 0003/0004 abilities
-- (flow.has_ability + open_module).

create extension if not exists pgcrypto;
create schema if not exists flow;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists flow.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'not_started',
  owner text,
  target_date date,
  -- Expansion bag: the milestone's tasks[] ({ id, title, status, assignee })
  -- live here (see MODULE_CONVENTIONS.md -> metadata).
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.milestones to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists milestones_project_idx
  on flow.milestones (project_id, target_date);

-- ---------------------------------------------------------------------------
-- updated_at trigger (reuses flow.set_updated_at from 0001_issues.sql)
-- ---------------------------------------------------------------------------

drop trigger if exists milestones_set_updated_at on flow.milestones;
create trigger milestones_set_updated_at
  before update on flow.milestones
  for each row execute function flow.set_updated_at();

-- ---------------------------------------------------------------------------
-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).
-- ---------------------------------------------------------------------------

insert into flow.open_module (module) values ('milestones')
  on conflict (module) do nothing;

-- ---------------------------------------------------------------------------
-- Row level security — ability-scoped, one policy per action.
-- ---------------------------------------------------------------------------

alter table flow.milestones enable row level security;

drop policy if exists milestones_select on flow.milestones;
create policy milestones_select on flow.milestones
  for select using (flow.has_ability(project_id, 'milestones.view'));

drop policy if exists milestones_insert on flow.milestones;
create policy milestones_insert on flow.milestones
  for insert with check (flow.has_ability(project_id, 'milestones.create'));

drop policy if exists milestones_update on flow.milestones;
create policy milestones_update on flow.milestones
  for update
  using (flow.has_ability(project_id, 'milestones.update'))
  with check (flow.has_ability(project_id, 'milestones.update'));

drop policy if exists milestones_delete on flow.milestones;
create policy milestones_delete on flow.milestones
  for delete using (flow.has_ability(project_id, 'milestones.delete'));
