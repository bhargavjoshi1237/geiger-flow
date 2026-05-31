create table if not exists public.flow_addons (
  id uuid primary key default gen_random_uuid(),
  addon_key text not null unique,
  name text not null,
  description text,
  version text not null default '1.0.0',
  category text,
  color text,
  features text[] not null default array[]::text[],
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_project_addons (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  addon_key text not null references public.flow_addons(addon_key) on delete cascade,
  enabled boolean not null default true,
  nav_position integer,
  settings jsonb not null default '{}'::jsonb,
  enabled_by uuid references auth.users(id) on delete set null,
  enabled_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, addon_key)
);

create table if not exists public.flow_sql_queries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text,
  query text not null,
  parameters jsonb not null default '{}'::jsonb,
  result_preview jsonb,
  duration_ms integer,
  row_count integer,
  status text not null default 'saved',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  executed_at timestamptz
);

create table if not exists public.flow_project_plus_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  addon_key text not null,
  code text not null,
  title text not null,
  description text,
  owner text,
  due text,
  status text,
  status_tone text,
  signal_label text,
  signal text,
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  view text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, addon_key, code)
);

create index if not exists flow_project_addons_project_idx on public.flow_project_addons (project_id, enabled);
create index if not exists flow_sql_queries_project_idx on public.flow_sql_queries (project_id, created_at desc);
create index if not exists flow_project_plus_items_project_addon_idx on public.flow_project_plus_items (project_id, addon_key, status);

alter table public.flow_addons enable row level security;
alter table public.flow_project_addons enable row level security;
alter table public.flow_sql_queries enable row level security;
alter table public.flow_project_plus_items enable row level security;

drop policy if exists flow_addons_public_select on public.flow_addons;
create policy flow_addons_public_select on public.flow_addons
for select using (true);

drop policy if exists flow_project_addons_project_all on public.flow_project_addons;
create policy flow_project_addons_project_all on public.flow_project_addons
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_sql_queries_project_all on public.flow_sql_queries;
create policy flow_sql_queries_project_all on public.flow_sql_queries
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_project_plus_items_project_all on public.flow_project_plus_items;
create policy flow_project_plus_items_project_all on public.flow_project_plus_items
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
