create table if not exists public.flow_planning_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  active boolean not null default false,
  viewport jsonb not null default '{}'::jsonb,
  canvas_settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_planning_nodes (
  id uuid primary key default gen_random_uuid(),
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  external_node_id text not null,
  type text not null,
  position point not null default point(0, 0),
  width numeric(10,2),
  height numeric(10,2),
  selected boolean not null default false,
  dragging boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  style jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (planning_file_id, external_node_id)
);

create table if not exists public.flow_planning_edges (
  id uuid primary key default gen_random_uuid(),
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  external_edge_id text not null,
  source_node_key text not null,
  target_node_key text not null,
  type text not null default 'center',
  selected boolean not null default false,
  marker_end jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  style jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (planning_file_id, external_edge_id)
);

create table if not exists public.flow_planning_collaborators (
  id uuid primary key default gen_random_uuid(),
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  cursor_position point,
  selection jsonb not null default '{}'::jsonb,
  color text,
  last_seen_at timestamptz not null default now(),
  unique (planning_file_id, user_id)
);

create index if not exists flow_planning_files_project_idx on public.flow_planning_files (project_id, updated_at desc);
create index if not exists flow_planning_nodes_data_idx on public.flow_planning_nodes using gin (data);

alter table public.flow_planning_files enable row level security;
alter table public.flow_planning_nodes enable row level security;
alter table public.flow_planning_edges enable row level security;
alter table public.flow_planning_collaborators enable row level security;

drop policy if exists flow_planning_files_project_all on public.flow_planning_files;
create policy flow_planning_files_project_all on public.flow_planning_files
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_planning_nodes_project_all on public.flow_planning_nodes;
create policy flow_planning_nodes_project_all on public.flow_planning_nodes
for all using (exists (select 1 from public.flow_planning_files file where file.id = planning_file_id and public.flow_is_project_member(file.project_id)))
with check (exists (select 1 from public.flow_planning_files file where file.id = planning_file_id and public.flow_is_project_member(file.project_id)));

drop policy if exists flow_planning_edges_project_all on public.flow_planning_edges;
create policy flow_planning_edges_project_all on public.flow_planning_edges
for all using (exists (select 1 from public.flow_planning_files file where file.id = planning_file_id and public.flow_is_project_member(file.project_id)))
with check (exists (select 1 from public.flow_planning_files file where file.id = planning_file_id and public.flow_is_project_member(file.project_id)));

drop policy if exists flow_planning_collaborators_project_all on public.flow_planning_collaborators;
create policy flow_planning_collaborators_project_all on public.flow_planning_collaborators
for all using (exists (select 1 from public.flow_planning_files file where file.id = planning_file_id and public.flow_is_project_member(file.project_id)))
with check (exists (select 1 from public.flow_planning_files file where file.id = planning_file_id and public.flow_is_project_member(file.project_id)));
