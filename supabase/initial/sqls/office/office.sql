create table if not exists public.flow_office_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null default 'Untitled folder',
  color text not null default '#4285f4',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_office_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  folder_id uuid references public.flow_office_folders(id) on delete set null,
  type text not null check (type in ('document', 'spreadsheet', 'presentation')),
  name text not null default 'Untitled',
  content jsonb not null default '{}'::jsonb,
  starred boolean not null default false,
  trashed boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_office_file_shares (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references public.flow_office_files(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  shared_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (file_id, project_id)
);

create index if not exists flow_office_folders_project_idx on public.flow_office_folders (project_id, updated_at desc);
create index if not exists flow_office_files_project_idx on public.flow_office_files (project_id, updated_at desc);
create index if not exists flow_office_files_folder_idx on public.flow_office_files (project_id, folder_id);
create index if not exists flow_office_files_type_idx on public.flow_office_files (project_id, type);
create index if not exists flow_office_files_starred_idx on public.flow_office_files (project_id, starred) where starred = true;
create index if not exists flow_office_file_shares_project_idx on public.flow_office_file_shares (project_id);
create index if not exists flow_office_file_shares_file_idx on public.flow_office_file_shares (file_id);

alter table public.flow_office_folders enable row level security;
alter table public.flow_office_files enable row level security;
alter table public.flow_office_file_shares enable row level security;

drop policy if exists flow_office_folders_project_all on public.flow_office_folders;
create policy flow_office_folders_project_all on public.flow_office_folders
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_office_files_project_all on public.flow_office_files;
create policy flow_office_files_project_all on public.flow_office_files
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_office_file_shares_project_all on public.flow_office_file_shares;
create policy flow_office_file_shares_project_all on public.flow_office_file_shares
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

create or replace function public.update_flow_office_folders_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists flow_office_folders_updated_at on public.flow_office_folders;
create trigger flow_office_folders_updated_at
before update on public.flow_office_folders
for each row execute function public.update_flow_office_folders_updated_at();

create or replace function public.update_flow_office_files_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists flow_office_files_updated_at on public.flow_office_files;
create trigger flow_office_files_updated_at
before update on public.flow_office_files
for each row execute function public.update_flow_office_files_updated_at();
