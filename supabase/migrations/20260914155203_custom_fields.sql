-- Custom fields
--
-- Owns flow.custom_fields: reusable custom-field definitions scoped to a
-- project (Settings -> Customs). Options for select-type fields live in the
-- options jsonb column; future per-field config goes in metadata.

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

create table if not exists flow.custom_fields (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  type text not null default 'text'
    check (type in ('text', 'number', 'select', 'date', 'boolean', 'formula')),
  scope text not null default 'Tasks'
    check (scope in ('Tasks', 'Milestones', 'Goals', 'Projects')),
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

grant all on flow.custom_fields to anon, authenticated, service_role;

create index if not exists custom_fields_project_idx
  on flow.custom_fields (project_id, created_at desc);

create unique index if not exists custom_fields_project_scope_name_idx
  on flow.custom_fields (project_id, scope, name)
  where deleted_at is null;

drop trigger if exists custom_fields_touch_updated_at on flow.custom_fields;
create trigger custom_fields_touch_updated_at
before update on flow.custom_fields
for each row execute function flow.touch_updated_at();

-- Demo-open RLS (the dashboard runs unauthenticated). Tighten once auth lands.
alter table flow.custom_fields enable row level security;

drop policy if exists custom_fields_demo_all on flow.custom_fields;
create policy custom_fields_demo_all on flow.custom_fields
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- @down
drop table if exists flow.custom_fields cascade;
