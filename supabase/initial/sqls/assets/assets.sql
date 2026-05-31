create table if not exists public.flow_asset_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  parent_id uuid references public.flow_asset_folders(id) on delete cascade,
  name text not null,
  description text,
  path ltree,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  folder_id uuid references public.flow_asset_folders(id) on delete set null,
  storage_bucket text not null default 'flow-assets',
  storage_path text not null,
  name text not null,
  type text not null,
  format text,
  mime_type text,
  size_bytes bigint not null default 0,
  dimensions int4range,
  checksum bytea,
  status text not null default 'Active' check (status in ('Draft', 'Active', 'Archived', 'Deleted')),
  usage_count integer not null default 0,
  tags text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (project_id, storage_path)
);

create table if not exists public.flow_asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.flow_assets(id) on delete cascade,
  version_number integer not null,
  storage_path text not null,
  size_bytes bigint not null default 0,
  checksum bytea,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (asset_id, version_number)
);

create table if not exists public.flow_asset_activity (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.flow_assets(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists flow_asset_folders_project_idx on public.flow_asset_folders (project_id, parent_id);
create index if not exists flow_assets_project_type_idx on public.flow_assets (project_id, type, status);
create index if not exists flow_assets_tags_idx on public.flow_assets using gin (tags);
create index if not exists flow_assets_metadata_idx on public.flow_assets using gin (metadata);

alter table public.flow_asset_folders enable row level security;
alter table public.flow_assets enable row level security;
alter table public.flow_asset_versions enable row level security;
alter table public.flow_asset_activity enable row level security;

drop policy if exists flow_asset_folders_project_all on public.flow_asset_folders;
create policy flow_asset_folders_project_all on public.flow_asset_folders
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_assets_project_all on public.flow_assets;
create policy flow_assets_project_all on public.flow_assets
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_asset_versions_project_all on public.flow_asset_versions;
create policy flow_asset_versions_project_all on public.flow_asset_versions
for all using (exists (select 1 from public.flow_assets asset where asset.id = asset_id and public.flow_is_project_member(asset.project_id)))
with check (exists (select 1 from public.flow_assets asset where asset.id = asset_id and public.flow_is_project_member(asset.project_id)));

drop policy if exists flow_asset_activity_project_select on public.flow_asset_activity;
create policy flow_asset_activity_project_select on public.flow_asset_activity
for select using (public.flow_is_project_member(project_id));
