create table if not exists public.flow_goals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  objective_id uuid,
  title text not null,
  description text,
  status text not null default 'not_started' check (status in ('not_started', 'on_track', 'at_risk', 'completed', 'archived')),
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  owner_id uuid references auth.users(id) on delete set null,
  owner_name text,
  target_date date,
  progress_source text,
  track_metric text,
  target_value numeric,
  current_value numeric,
  unit text,
  tags text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.flow_goal_key_results (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.flow_goals(id) on delete cascade,
  label text not null,
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  done boolean not null default false,
  target_value numeric,
  current_value numeric,
  unit text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flow_goals_project_status_idx on public.flow_goals (project_id, status, target_date);

alter table public.flow_goals enable row level security;
alter table public.flow_goal_key_results enable row level security;

drop policy if exists flow_goals_project_all on public.flow_goals;
create policy flow_goals_project_all on public.flow_goals
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_goal_key_results_project_all on public.flow_goal_key_results;
create policy flow_goal_key_results_project_all on public.flow_goal_key_results
for all using (exists (select 1 from public.flow_goals goal where goal.id = goal_id and public.flow_is_project_member(goal.project_id)))
with check (exists (select 1 from public.flow_goals goal where goal.id = goal_id and public.flow_is_project_member(goal.project_id)));
