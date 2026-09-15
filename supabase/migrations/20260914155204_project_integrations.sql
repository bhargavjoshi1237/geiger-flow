-- Project integrations
--
-- Owns flow.project_integrations: external services wired into a project
-- (Settings -> Connections). Event subscriptions live in the events jsonb
-- column; provider-specific config goes in metadata.

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

create table if not exists flow.project_integrations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  provider text not null default 'github',
  name text not null,
  url text,
  status text not null default 'active'
    check (status in ('active', 'paused', 'error')),
  events jsonb not null default '[]'::jsonb,
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

grant all on flow.project_integrations to anon, authenticated, service_role;

create index if not exists project_integrations_project_idx
  on flow.project_integrations (project_id, created_at desc);

drop trigger if exists project_integrations_touch_updated_at on flow.project_integrations;
create trigger project_integrations_touch_updated_at
before update on flow.project_integrations
for each row execute function flow.touch_updated_at();

-- Demo-open RLS (the dashboard runs unauthenticated). Tighten once auth lands.
alter table flow.project_integrations enable row level security;

drop policy if exists project_integrations_demo_all on flow.project_integrations;
create policy project_integrations_demo_all on flow.project_integrations
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- @down
drop table if exists flow.project_integrations cascade;
