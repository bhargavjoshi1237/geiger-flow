create table if not exists public.flow_objectives (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'not_started' check (status in ('not_started', 'on_track', 'at_risk', 'completed', 'archived')),
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  owner_id uuid references auth.users(id) on delete set null,
  owner_name text,
  start_date date,
  target_date date,
  view_state jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.flow_objective_key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.flow_objectives(id) on delete cascade,
  label text not null,
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  done boolean not null default false,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_objective_goal_links (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.flow_objectives(id) on delete cascade,
  goal_id uuid not null references public.flow_goals(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (objective_id, goal_id)
);

create index if not exists flow_objectives_project_status_idx on public.flow_objectives (project_id, status, target_date);

alter table public.flow_objectives enable row level security;
alter table public.flow_objective_key_results enable row level security;
alter table public.flow_objective_goal_links enable row level security;

drop policy if exists flow_objectives_project_all on public.flow_objectives;
create policy flow_objectives_project_all on public.flow_objectives
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_objective_key_results_project_all on public.flow_objective_key_results;
create policy flow_objective_key_results_project_all on public.flow_objective_key_results
for all using (exists (select 1 from public.flow_objectives objective where objective.id = objective_id and public.flow_is_project_member(objective.project_id)))
with check (exists (select 1 from public.flow_objectives objective where objective.id = objective_id and public.flow_is_project_member(objective.project_id)));

drop policy if exists flow_objective_goal_links_project_all on public.flow_objective_goal_links;
create policy flow_objective_goal_links_project_all on public.flow_objective_goal_links
for all using (exists (select 1 from public.flow_objectives objective where objective.id = objective_id and public.flow_is_project_member(objective.project_id)))
with check (exists (select 1 from public.flow_objectives objective where objective.id = objective_id and public.flow_is_project_member(objective.project_id)));
