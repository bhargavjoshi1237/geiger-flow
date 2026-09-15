-- SQL history
--
-- Owns flow.sql_history: persisted query log for the SQL Explorer addon
-- (query text + status/row-count/duration summary). There is deliberately NO
-- execute_sql RPC in this migration: a security-definer function that runs
-- arbitrary SQL would bypass RLS and allow write/escalation abuse from the
-- anon key. The explorer instead reads through the whitelisted supabase query
-- builder (per-table selects on known flow.* tables) and only the history
-- summary is persisted here. Self-contained and idempotent.

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

create table if not exists flow.sql_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  query_text text not null,
  -- 'success' | 'error'
  status text not null default 'success',
  message text,
  row_count integer not null default 0,
  duration_ms integer not null default 0,
  -- result column names for the summary view
  columns jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.sql_history to anon, authenticated, service_role;

create index if not exists sql_history_project_idx
  on flow.sql_history (project_id, created_at desc);

create index if not exists sql_history_live_idx
  on flow.sql_history (id)
  where deleted_at is null;

drop trigger if exists sql_history_touch_updated_at on flow.sql_history;
create trigger sql_history_touch_updated_at
  before update on flow.sql_history
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js once the settings agent classifies addon abilities).

insert into flow.open_module (module) values ('sql')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.sql_history enable row level security;

drop policy if exists sql_history_select on flow.sql_history;
create policy sql_history_select on flow.sql_history
  for select using (flow.has_ability(project_id, 'sql.view'));

drop policy if exists sql_history_insert on flow.sql_history;
create policy sql_history_insert on flow.sql_history
  for insert with check (flow.has_ability(project_id, 'sql.create'));

drop policy if exists sql_history_update on flow.sql_history;
create policy sql_history_update on flow.sql_history
  for update
  using (flow.has_ability(project_id, 'sql.update'))
  with check (flow.has_ability(project_id, 'sql.update'));

drop policy if exists sql_history_delete on flow.sql_history;
create policy sql_history_delete on flow.sql_history
  for delete using (flow.has_ability(project_id, 'sql.delete'));

-- @down
drop table if exists flow.sql_history cascade;

delete from flow.open_module where module = 'sql';
