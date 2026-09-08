-- Security module
--
-- Owns the four security tables:
--   flow.security_policies         — access policies (monitor/enforce)
--   flow.security_vulnerabilities  — risk queue findings
--   flow.security_access_events    — authentication / sensitive-action feed
--   flow.api_keys                  — project credentials (prefix ONLY, never
--                                    the full secret, which never leaves the
--                                    client that minted it)
-- Self-contained and idempotent: creates the schema, the shared updated_at
-- trigger function, the tables, their indexes and ability-scoped RLS.

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

-- ---------------------------------------------------------------------------
-- flow.security_policies
-- ---------------------------------------------------------------------------

create table if not exists flow.security_policies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  -- what surface the policy covers (e.g. 'members', 'api', 'data')
  scope text,
  -- 'monitor' logs violations; 'enforce' blocks them
  enforcement text not null default 'monitor'
    check (enforcement in ('monitor', 'enforce')),
  is_enabled boolean not null default true,
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.security_policies to anon, authenticated, service_role;

create index if not exists security_policies_project_idx
  on flow.security_policies (project_id, created_at desc);

create index if not exists security_policies_live_idx
  on flow.security_policies (project_id)
  where deleted_at is null;

drop trigger if exists security_policies_touch_updated_at on flow.security_policies;
create trigger security_policies_touch_updated_at
before update on flow.security_policies
for each row execute function flow.touch_updated_at();

-- ---------------------------------------------------------------------------
-- flow.security_vulnerabilities
-- ---------------------------------------------------------------------------

create table if not exists flow.security_vulnerabilities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  severity text not null default 'medium'
    check (severity in ('critical', 'high', 'medium', 'low')),
  -- workflow: open -> triaged -> resolved
  status text not null default 'open'
    check (status in ('open', 'triaged', 'resolved')),
  affected text,
  detected_on date not null default current_date,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.security_vulnerabilities to anon, authenticated, service_role;

create index if not exists security_vulnerabilities_project_idx
  on flow.security_vulnerabilities (project_id, status);

create index if not exists security_vulnerabilities_detected_idx
  on flow.security_vulnerabilities (project_id, detected_on desc);

drop trigger if exists security_vulnerabilities_touch_updated_at on flow.security_vulnerabilities;
create trigger security_vulnerabilities_touch_updated_at
before update on flow.security_vulnerabilities
for each row execute function flow.touch_updated_at();

-- ---------------------------------------------------------------------------
-- flow.security_access_events
-- ---------------------------------------------------------------------------

create table if not exists flow.security_access_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor text,
  action text not null,
  target text,
  result text not null default 'allowed'
    check (result in ('allowed', 'denied')),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.security_access_events to anon, authenticated, service_role;

create index if not exists security_access_events_project_idx
  on flow.security_access_events (project_id, occurred_at desc);

create index if not exists security_access_events_result_idx
  on flow.security_access_events (project_id, result);

drop trigger if exists security_access_events_touch_updated_at on flow.security_access_events;
create trigger security_access_events_touch_updated_at
before update on flow.security_access_events
for each row execute function flow.touch_updated_at();

-- ---------------------------------------------------------------------------
-- flow.api_keys — stores a short non-secret prefix ONLY (e.g. 'gfk_ab12cd').
-- The full secret is shown once to the creator and never persisted.
-- ---------------------------------------------------------------------------

create table if not exists flow.api_keys (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  -- postgres text[] of granted scopes (e.g. '{read,deploy}')
  scopes text[] not null default '{}'::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  is_revoked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.api_keys to anon, authenticated, service_role;

create index if not exists api_keys_project_idx
  on flow.api_keys (project_id, created_at desc);

create index if not exists api_keys_live_idx
  on flow.api_keys (project_id)
  where deleted_at is null;

drop trigger if exists api_keys_touch_updated_at on flow.api_keys;
create trigger api_keys_touch_updated_at
before update on flow.api_keys
for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('security')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action per table.

alter table flow.security_policies enable row level security;

drop policy if exists security_policies_select on flow.security_policies;
create policy security_policies_select on flow.security_policies
  for select using (flow.has_ability(project_id, 'security.view'));

drop policy if exists security_policies_insert on flow.security_policies;
create policy security_policies_insert on flow.security_policies
  for insert with check (flow.has_ability(project_id, 'security.create'));

drop policy if exists security_policies_update on flow.security_policies;
create policy security_policies_update on flow.security_policies
  for update
  using (flow.has_ability(project_id, 'security.update'))
  with check (flow.has_ability(project_id, 'security.update'));

drop policy if exists security_policies_delete on flow.security_policies;
create policy security_policies_delete on flow.security_policies
  for delete using (flow.has_ability(project_id, 'security.delete'));

alter table flow.security_vulnerabilities enable row level security;

drop policy if exists security_vulnerabilities_select on flow.security_vulnerabilities;
create policy security_vulnerabilities_select on flow.security_vulnerabilities
  for select using (flow.has_ability(project_id, 'security.view'));

drop policy if exists security_vulnerabilities_insert on flow.security_vulnerabilities;
create policy security_vulnerabilities_insert on flow.security_vulnerabilities
  for insert with check (flow.has_ability(project_id, 'security.create'));

drop policy if exists security_vulnerabilities_update on flow.security_vulnerabilities;
create policy security_vulnerabilities_update on flow.security_vulnerabilities
  for update
  using (flow.has_ability(project_id, 'security.update'))
  with check (flow.has_ability(project_id, 'security.update'));

drop policy if exists security_vulnerabilities_delete on flow.security_vulnerabilities;
create policy security_vulnerabilities_delete on flow.security_vulnerabilities
  for delete using (flow.has_ability(project_id, 'security.delete'));

alter table flow.security_access_events enable row level security;

drop policy if exists security_access_events_select on flow.security_access_events;
create policy security_access_events_select on flow.security_access_events
  for select using (flow.has_ability(project_id, 'security.view'));

drop policy if exists security_access_events_insert on flow.security_access_events;
create policy security_access_events_insert on flow.security_access_events
  for insert with check (flow.has_ability(project_id, 'security.create'));

drop policy if exists security_access_events_update on flow.security_access_events;
create policy security_access_events_update on flow.security_access_events
  for update
  using (flow.has_ability(project_id, 'security.update'))
  with check (flow.has_ability(project_id, 'security.update'));

drop policy if exists security_access_events_delete on flow.security_access_events;
create policy security_access_events_delete on flow.security_access_events
  for delete using (flow.has_ability(project_id, 'security.delete'));

alter table flow.api_keys enable row level security;

drop policy if exists api_keys_select on flow.api_keys;
create policy api_keys_select on flow.api_keys
  for select using (flow.has_ability(project_id, 'security.view'));

drop policy if exists api_keys_insert on flow.api_keys;
create policy api_keys_insert on flow.api_keys
  for insert with check (flow.has_ability(project_id, 'security.create'));

drop policy if exists api_keys_update on flow.api_keys;
create policy api_keys_update on flow.api_keys
  for update
  using (flow.has_ability(project_id, 'security.update'))
  with check (flow.has_ability(project_id, 'security.update'));

drop policy if exists api_keys_delete on flow.api_keys;
create policy api_keys_delete on flow.api_keys
  for delete using (flow.has_ability(project_id, 'security.delete'));

-- @down
drop table if exists flow.api_keys cascade;
drop table if exists flow.security_access_events cascade;
drop table if exists flow.security_vulnerabilities cascade;
drop table if exists flow.security_policies cascade;

delete from flow.open_module where module = 'security';
