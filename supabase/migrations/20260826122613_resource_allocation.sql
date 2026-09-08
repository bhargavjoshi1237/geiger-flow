-- Resource allocation
--
-- Owns flow.resource_allocations (who is staffed on a project: member, role,
-- percent allocation, status, staffing window) and flow.resource_requests
-- (open asks for extra capacity, resolved by approve/deny). Self-contained and
-- idempotent: creates the schema, the shared updated_at trigger function, both
-- tables, their indexes and ability-scoped RLS.

-- @up
create extension if not exists pgcrypto;

create schema if not exists flow;
grant usage on schema flow to anon, authenticated, service_role;

-- Shared "touch updated_at" trigger function (suite convention). Defined here
-- so this migration never depends on another having run first.
create or replace function flow.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
 $$;

create table if not exists flow.resource_allocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  -- display name of the allocated person
  member text not null,
  role text,
  -- percent of capacity, kept in the 0..100 range by the data layer
  allocation integer not null default 0,
  -- 'active' | 'planned' | 'completed'
  status text not null default 'active',
  starts_on date not null default current_date,
  ends_on date,
  notes text,
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.resource_allocations to anon, authenticated, service_role;

create index if not exists resource_allocations_project_idx
  on flow.resource_allocations (project_id, starts_on);

create index if not exists resource_allocations_live_idx
  on flow.resource_allocations (id)
  where deleted_at is null;

drop trigger if exists resource_allocations_touch_updated_at on flow.resource_allocations;
create trigger resource_allocations_touch_updated_at
  before update on flow.resource_allocations
  for each row execute function flow.touch_updated_at();

create table if not exists flow.resource_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requester text not null,
  request text not null,
  -- who/what the ask targets (role, team, tool...)
  target text,
  -- 'pending' | 'approved' | 'denied'
  status text not null default 'pending',
  requested_on date not null default current_date,
  -- stamped when the request moves out of 'pending'
  resolved_at timestamptz,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.resource_requests to anon, authenticated, service_role;

create index if not exists resource_requests_project_idx
  on flow.resource_requests (project_id, requested_on);

create index if not exists resource_requests_live_idx
  on flow.resource_requests (id)
  where deleted_at is null;

drop trigger if exists resource_requests_touch_updated_at on flow.resource_requests;
create trigger resource_requests_touch_updated_at
  before update on flow.resource_requests
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('resources')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action (mirrors
-- flow.time_entries).

alter table flow.resource_allocations enable row level security;

drop policy if exists resource_allocations_select on flow.resource_allocations;
create policy resource_allocations_select on flow.resource_allocations
  for select using (flow.has_ability(project_id, 'resources.view'));

drop policy if exists resource_allocations_insert on flow.resource_allocations;
create policy resource_allocations_insert on flow.resource_allocations
  for insert with check (flow.has_ability(project_id, 'resources.create'));

drop policy if exists resource_allocations_update on flow.resource_allocations;
create policy resource_allocations_update on flow.resource_allocations
  for update
  using (flow.has_ability(project_id, 'resources.update'))
  with check (flow.has_ability(project_id, 'resources.update'));

drop policy if exists resource_allocations_delete on flow.resource_allocations;
create policy resource_allocations_delete on flow.resource_allocations
  for delete using (flow.has_ability(project_id, 'resources.delete'));

alter table flow.resource_requests enable row level security;

drop policy if exists resource_requests_select on flow.resource_requests;
create policy resource_requests_select on flow.resource_requests
  for select using (flow.has_ability(project_id, 'resources.view'));

drop policy if exists resource_requests_insert on flow.resource_requests;
create policy resource_requests_insert on flow.resource_requests
  for insert with check (flow.has_ability(project_id, 'resources.create'));

drop policy if exists resource_requests_update on flow.resource_requests;
create policy resource_requests_update on flow.resource_requests
  for update
  using (flow.has_ability(project_id, 'resources.update'))
  with check (flow.has_ability(project_id, 'resources.update'));

drop policy if exists resource_requests_delete on flow.resource_requests;
create policy resource_requests_delete on flow.resource_requests
  for delete using (flow.has_ability(project_id, 'resources.delete'));

-- @down
drop table if exists flow.resource_requests cascade;
drop table if exists flow.resource_allocations cascade;

delete from flow.open_module where module = 'resources';
