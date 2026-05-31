create table if not exists public.flow_projections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  projection_type text not null,
  horizon daterange,
  confidence numeric(5,2) check (confidence >= 0 and confidence <= 100),
  baseline jsonb not null default '{}'::jsonb,
  forecast jsonb not null default '{}'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flow_projections_project_type_idx on public.flow_projections (project_id, projection_type);

alter table public.flow_projections enable row level security;

drop policy if exists flow_projections_project_all on public.flow_projections;
create policy flow_projections_project_all on public.flow_projections
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
