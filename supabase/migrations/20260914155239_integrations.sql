-- Integrations
--
-- Owns flow.integrations — one row per connected workspace tool
-- (organization_id + provider is unique while live). Status is
-- 'connected' | 'disconnected'; provider-specific config lives in the
-- metadata expansion bag. Self-contained: creates the schema, the shared
-- updated_at trigger function, the table, its indexes and RLS.

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

create table if not exists flow.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  provider text not null,
  status text not null default 'disconnected'
    check (status in ('connected', 'disconnected')),
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Backfill for copies created between scaffolding and this edit.
alter table flow.integrations
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table flow.integrations
  add column if not exists provider text;
alter table flow.integrations
  add column if not exists status text not null default 'disconnected';

grant all on flow.integrations to anon, authenticated, service_role;

create index if not exists integrations_created_at_idx
  on flow.integrations (created_at desc);

create index if not exists integrations_org_idx
  on flow.integrations (organization_id, created_at desc);

create unique index if not exists integrations_org_provider_idx
  on flow.integrations (organization_id, provider)
  where deleted_at is null;

create index if not exists integrations_live_idx
  on flow.integrations (id)
  where deleted_at is null;

drop trigger if exists integrations_touch_updated_at on flow.integrations;
create trigger integrations_touch_updated_at
before update on flow.integrations
for each row execute function flow.touch_updated_at();

-- Demo-open RLS (the dashboard runs unauthenticated). Tighten once auth lands.
alter table flow.integrations enable row level security;

drop policy if exists integrations_demo_all on flow.integrations;
create policy integrations_demo_all on flow.integrations
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- @down
drop table if exists flow.integrations cascade;
