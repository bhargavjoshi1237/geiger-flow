create table if not exists public.flow_project_settings (
  project_id uuid primary key references public.flow_projects(id) on delete cascade,
  general jsonb not null default '{}'::jsonb,
  connections jsonb not null default '{}'::jsonb,
  customs jsonb not null default '{}'::jsonb,
  usage_limits jsonb not null default '{}'::jsonb,
  advanced jsonb not null default '{}'::jsonb,
  enterprise jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_custom_fields (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  entity_type text not null,
  key text not null,
  label text not null,
  field_type text not null,
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  default_value jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, entity_type, key)
);

create table if not exists public.flow_connections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  provider text not null,
  name text not null,
  status text not null default 'disconnected',
  config jsonb not null default '{}'::jsonb,
  credential_ref text,
  last_checked_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_datasets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  description text,
  source_connection_id uuid references public.flow_connections(id) on delete set null,
  schema_json jsonb not null default '{}'::jsonb,
  row_count bigint,
  size_bytes bigint,
  status text not null default 'ready',
  refreshed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flow_custom_fields_project_entity_idx on public.flow_custom_fields (project_id, entity_type);
create index if not exists flow_connections_project_provider_idx on public.flow_connections (project_id, provider, status);
create index if not exists flow_datasets_project_idx on public.flow_datasets (project_id, status);

alter table public.flow_project_settings enable row level security;
alter table public.flow_custom_fields enable row level security;
alter table public.flow_connections enable row level security;
alter table public.flow_datasets enable row level security;

drop policy if exists flow_project_settings_project_all on public.flow_project_settings;
create policy flow_project_settings_project_all on public.flow_project_settings
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_custom_fields_project_all on public.flow_custom_fields;
create policy flow_custom_fields_project_all on public.flow_custom_fields
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_connections_project_all on public.flow_connections;
create policy flow_connections_project_all on public.flow_connections
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_datasets_project_all on public.flow_datasets;
create policy flow_datasets_project_all on public.flow_datasets
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
