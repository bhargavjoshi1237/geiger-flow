-- Time tracking module
--
-- Owns flow.time_entries: manual/timer time logged against a project and
-- optionally one of its tasks. Powers the Reporting timesheet (weekly rollup,
-- billable split, variance against estimates). Self-contained and idempotent.

-- @up
create extension if not exists pgcrypto;
create schema if not exists flow;
grant usage on schema flow to anon, authenticated, service_role;

create or replace function flow.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists flow.time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  -- optional link to the task the effort was spent on
  task_id uuid references flow.tasks(id) on delete set null,
  title text not null,
  owner text,
  -- calendar day the effort belongs to
  worked_on date not null default current_date,
  -- minutes, always stored as an integer
  minutes integer not null default 0,
  billable boolean not null default true,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.time_entries to anon, authenticated, service_role;

create index if not exists time_entries_project_idx
  on flow.time_entries (project_id, worked_on);

create index if not exists time_entries_task_idx
  on flow.time_entries (task_id);

drop trigger if exists time_entries_touch_updated_at on flow.time_entries;
create trigger time_entries_touch_updated_at
  before update on flow.time_entries
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('time')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.time_entries enable row level security;

drop policy if exists time_entries_select on flow.time_entries;
create policy time_entries_select on flow.time_entries
  for select using (flow.has_ability(project_id, 'time.view'));

drop policy if exists time_entries_insert on flow.time_entries;
create policy time_entries_insert on flow.time_entries
  for insert with check (flow.has_ability(project_id, 'time.create'));

drop policy if exists time_entries_update on flow.time_entries;
create policy time_entries_update on flow.time_entries
  for update
  using (flow.has_ability(project_id, 'time.update'))
  with check (flow.has_ability(project_id, 'time.update'));

drop policy if exists time_entries_delete on flow.time_entries;
create policy time_entries_delete on flow.time_entries
  for delete using (flow.has_ability(project_id, 'time.delete'));

-- @down
drop table if exists flow.time_entries cascade;

delete from flow.open_module where module = 'time';
