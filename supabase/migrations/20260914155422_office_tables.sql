-- Office tables
--
-- Owns flow.office_files, flow.office_folders and flow.office_file_shares:
-- the project file library behind the Office Recent / Folders / Shared
-- screens. Self-contained: creates the schema, the shared updated_at trigger
-- function, the tables, their indexes and RLS.

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

create table if not exists flow.office_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid,
  name text not null,
  color text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists flow.office_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid,
  folder_id uuid references flow.office_folders(id) on delete set null,
  -- document | spreadsheet | presentation
  type text not null default 'document',
  name text not null,
  content jsonb not null default '{}'::jsonb,
  starred boolean not null default false,
  trashed boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists flow.office_file_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_id uuid not null references flow.office_files(id) on delete cascade,
  shared_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

grant all on flow.office_folders to anon, authenticated, service_role;
grant all on flow.office_files to anon, authenticated, service_role;
grant all on flow.office_file_shares to anon, authenticated, service_role;

create index if not exists office_folders_project_idx
  on flow.office_folders (project_id, updated_at desc);
create index if not exists office_folders_live_idx
  on flow.office_folders (id)
  where deleted_at is null;

create index if not exists office_files_project_idx
  on flow.office_files (project_id, updated_at desc);
create index if not exists office_files_folder_idx
  on flow.office_files (folder_id)
  where deleted_at is null;
create index if not exists office_files_live_idx
  on flow.office_files (id)
  where deleted_at is null;

create index if not exists office_file_shares_project_idx
  on flow.office_file_shares (project_id, created_at desc);
create index if not exists office_file_shares_file_idx
  on flow.office_file_shares (file_id)
  where deleted_at is null;

drop trigger if exists office_folders_touch_updated_at on flow.office_folders;
create trigger office_folders_touch_updated_at
before update on flow.office_folders
for each row execute function flow.touch_updated_at();

drop trigger if exists office_files_touch_updated_at on flow.office_files;
create trigger office_files_touch_updated_at
before update on flow.office_files
for each row execute function flow.touch_updated_at();

drop trigger if exists office_file_shares_touch_updated_at on flow.office_file_shares;
create trigger office_file_shares_touch_updated_at
before update on flow.office_file_shares
for each row execute function flow.touch_updated_at();

-- Demo-open RLS (the dashboard runs unauthenticated). Tighten once auth lands.
alter table flow.office_folders enable row level security;

drop policy if exists office_folders_demo_all on flow.office_folders;
create policy office_folders_demo_all on flow.office_folders
  for all
  to anon, authenticated
  using (true)
  with check (true);

alter table flow.office_files enable row level security;

drop policy if exists office_files_demo_all on flow.office_files;
create policy office_files_demo_all on flow.office_files
  for all
  to anon, authenticated
  using (true)
  with check (true);

alter table flow.office_file_shares enable row level security;

drop policy if exists office_file_shares_demo_all on flow.office_file_shares;
create policy office_file_shares_demo_all on flow.office_file_shares
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- @down
drop table if exists flow.office_file_shares cascade;
drop table if exists flow.office_files cascade;
drop table if exists flow.office_folders cascade;
