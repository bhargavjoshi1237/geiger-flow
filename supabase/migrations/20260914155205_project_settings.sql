-- Project settings
--
-- Owns flow.project_settings: one row per project holding the operational
-- toggles for Settings -> Advanced (read-only, maintenance, audit logging,
-- rate limiting, IP restriction, request signing), Settings -> Enterprise
-- (SSO, SCIM, retention, encryption, whitelist, audit trail), add-on prefs
-- (enabled, nav positions, colors), webhooks and env variables. Everything
-- not yet promoted lives in the metadata expansion bag; the
-- flow.project_merge_settings() RPC shallow-merges a patch so one tab never
-- clobbers another.

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

create table if not exists flow.project_settings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  visibility text not null default 'private'
    check (visibility in ('private', 'internal', 'public')),
  region text not null default 'us-east-1',
  -- Expansion bag: { advanced: {...}, enterprise: {...}, addons: {...},
  -- webhooks: [...], variables: [...] }. Promote to a real column once a key
  -- needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

grant all on flow.project_settings to anon, authenticated, service_role;

create index if not exists project_settings_project_idx
  on flow.project_settings (project_id)
  where deleted_at is null;

drop trigger if exists project_settings_touch_updated_at on flow.project_settings;
create trigger project_settings_touch_updated_at
before update on flow.project_settings
for each row execute function flow.touch_updated_at();

-- Shallow-merge a patch into the metadata bag, creating the row when absent.
-- One settings tab writes only its own keys, so concurrent tabs never clobber
-- each other the way a full-row upsert would.
create or replace function flow.project_merge_settings(p_project_id uuid, p_patch jsonb)
returns flow.project_settings
language plpgsql
as $$
declare
  result flow.project_settings;
begin
  insert into flow.project_settings (project_id, metadata)
  values (p_project_id, coalesce(p_patch, '{}'::jsonb))
  on conflict (project_id)
  do update set
    metadata = flow.project_settings.metadata || excluded.metadata,
    updated_at = now()
  returning * into result;
  return result;
end;
$$;

-- Demo-open RLS (the dashboard runs unauthenticated). Tighten once auth lands.
alter table flow.project_settings enable row level security;

drop policy if exists project_settings_demo_all on flow.project_settings;
create policy project_settings_demo_all on flow.project_settings
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- @down
drop function if exists flow.project_merge_settings(uuid, jsonb);
drop table if exists flow.project_settings cascade;
