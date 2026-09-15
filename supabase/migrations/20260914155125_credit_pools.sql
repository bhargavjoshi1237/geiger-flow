-- Credit pools
--
-- Owns flow.credit_pools: time-bound org credit budgets (e.g. AI token pools)
-- with a reset window. Allocations live in flow.credit_allocations and point
-- back via pool_id. Self-contained and idempotent.

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

create table if not exists flow.credit_pools (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  -- billing window label, e.g. 'September 2026'
  period text not null default '',
  -- 'tokens' | 'credits'
  unit text not null default 'tokens',
  total bigint not null default 0,
  allocated bigint not null default 0,
  used bigint not null default 0,
  -- 'on_track' | 'watch' | 'draft'
  status text not null default 'on_track',
  -- human reset label, e.g. 'Oct 1'
  reset_label text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.credit_pools to anon, authenticated, service_role;

create index if not exists credit_pools_project_idx
  on flow.credit_pools (project_id);

create index if not exists credit_pools_live_idx
  on flow.credit_pools (id)
  where deleted_at is null;

drop trigger if exists credit_pools_touch_updated_at on flow.credit_pools;
create trigger credit_pools_touch_updated_at
  before update on flow.credit_pools
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js once the settings agent classifies addon abilities).

insert into flow.open_module (module) values ('credits')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.credit_pools enable row level security;

drop policy if exists credit_pools_select on flow.credit_pools;
create policy credit_pools_select on flow.credit_pools
  for select using (flow.has_ability(project_id, 'credits.view'));

drop policy if exists credit_pools_insert on flow.credit_pools;
create policy credit_pools_insert on flow.credit_pools
  for insert with check (flow.has_ability(project_id, 'credits.create'));

drop policy if exists credit_pools_update on flow.credit_pools;
create policy credit_pools_update on flow.credit_pools
  for update
  using (flow.has_ability(project_id, 'credits.update'))
  with check (flow.has_ability(project_id, 'credits.update'));

drop policy if exists credit_pools_delete on flow.credit_pools;
create policy credit_pools_delete on flow.credit_pools
  for delete using (flow.has_ability(project_id, 'credits.delete'));

-- @down
drop table if exists flow.credit_pools cascade;

delete from flow.open_module where module = 'credits';
