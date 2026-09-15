-- Credit allocations
--
-- Owns flow.credit_allocations: slices of a flow.credit_pools row assigned to
-- a user, task, goal, milestone or module. Planned/used/remaining are derived
-- in the UI; this table stores the raw numbers. Self-contained and idempotent.
-- Runs after the credit_pools migration (pool_id FK).

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

create table if not exists flow.credit_allocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  pool_id uuid references flow.credit_pools(id) on delete cascade,
  target text not null default 'New allocation',
  -- 'User' | 'Task' | 'Goal' | 'Milestone' | 'Module'
  target_type text not null default 'Task',
  scope text not null default '',
  planned bigint not null default 0,
  used bigint not null default 0,
  -- 'on_track' | 'watch' | 'draft'
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.credit_allocations to anon, authenticated, service_role;

create index if not exists credit_allocations_project_idx
  on flow.credit_allocations (project_id);

create index if not exists credit_allocations_pool_idx
  on flow.credit_allocations (pool_id);

create index if not exists credit_allocations_live_idx
  on flow.credit_allocations (id)
  where deleted_at is null;

drop trigger if exists credit_allocations_touch_updated_at on flow.credit_allocations;
create trigger credit_allocations_touch_updated_at
  before update on flow.credit_allocations
  for each row execute function flow.touch_updated_at();

-- Same 'credits' module as credit_pools (idempotent re-insert).

insert into flow.open_module (module) values ('credits')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.credit_allocations enable row level security;

drop policy if exists credit_allocations_select on flow.credit_allocations;
create policy credit_allocations_select on flow.credit_allocations
  for select using (flow.has_ability(project_id, 'credits.view'));

drop policy if exists credit_allocations_insert on flow.credit_allocations;
create policy credit_allocations_insert on flow.credit_allocations
  for insert with check (flow.has_ability(project_id, 'credits.create'));

drop policy if exists credit_allocations_update on flow.credit_allocations;
create policy credit_allocations_update on flow.credit_allocations
  for update
  using (flow.has_ability(project_id, 'credits.update'))
  with check (flow.has_ability(project_id, 'credits.update'));

drop policy if exists credit_allocations_delete on flow.credit_allocations;
create policy credit_allocations_delete on flow.credit_allocations
  for delete using (flow.has_ability(project_id, 'credits.delete'));

-- @down
drop table if exists flow.credit_allocations cascade;
-- Keep the 'credits' open_module row while credit_pools still owns it.
