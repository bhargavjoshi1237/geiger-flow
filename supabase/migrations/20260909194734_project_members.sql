-- Project members
--
-- Owns flow.project_members — one row per project member (email required).
-- Self-contained and idempotent: creates the schema, the shared updated_at
-- trigger function, the table, its indexes, RLS, and backfills legacy
-- public.flow_teams JSONB blobs (guarded; not reversed on rollback).

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

create table if not exists flow.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid,
  email text not null,
  role text not null default 'member'
    check (role in ('admin', 'member', 'viewer', 'manager')),
  status text not null default 'Active'
    check (status in ('Active', 'Invited')),
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

grant all on flow.project_members to anon, authenticated, service_role;

create index if not exists project_members_project_idx
  on flow.project_members (project_id, created_at desc);

create unique index if not exists project_members_project_email_idx
  on flow.project_members (project_id, email)
  where deleted_at is null;

drop trigger if exists project_members_touch_updated_at on flow.project_members;
create trigger project_members_touch_updated_at
before update on flow.project_members
for each row execute function flow.touch_updated_at();

-- Demo-open RLS (the dashboard runs unauthenticated). Tighten once auth lands.
alter table flow.project_members enable row level security;

drop policy if exists project_members_demo_all on flow.project_members;
create policy project_members_demo_all on flow.project_members
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Backfill legacy public.flow_teams JSONB blobs (one row per member).
-- Guarded: skips entirely when the legacy table does not exist. Email is
-- required; rows without one are skipped. Role/status default when absent.
do $$
begin
  if to_regclass('public.flow_teams') is not null then
    insert into flow.project_members (project_id, email, role, status, metadata)
    select
      t.id as project_id,
      trim(m.value ->> 'email') as email,
      coalesce(nullif(m.value ->> 'role', ''), 'member') as role,
      coalesce(nullif(m.value ->> 'status', ''), 'Active') as status,
      case
        when m.value ->> 'name' is not null
          then jsonb_build_object('authorName', m.value ->> 'name')
        else '{}'::jsonb
      end as metadata
    from public.flow_teams t,
      lateral (
        select case
          when jsonb_typeof(t.members) = 'array' then t.members
          when jsonb_typeof(t.members) = 'object'
            then (select coalesce(jsonb_agg(v), '[]'::jsonb) from jsonb_each(t.members) e(v))
          else '[]'::jsonb
        end as arr
      ) norm,
      lateral jsonb_array_elements(norm.arr) m(value)
    where m.value ->> 'email' is not null
      and trim(m.value ->> 'email') <> ''
      and coalesce(nullif(m.value ->> 'role', ''), 'member')
        in ('admin', 'member', 'viewer', 'manager')
      and coalesce(nullif(m.value ->> 'status', ''), 'Active')
        in ('Active', 'Invited')
    on conflict (project_id, email) where deleted_at is null do nothing;
  end if;
end;
$$;

-- @down
drop table if exists flow.project_members cascade;
-- NOTE: the flow_teams backfill above is not reversed — legacy blob rows are
-- left untouched and re-backfilled rows stay deleted with the table.
