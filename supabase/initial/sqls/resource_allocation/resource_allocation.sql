create table if not exists public.flow_resource_allocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  member_id uuid references public.flow_project_members(id) on delete cascade,
  resource_type text not null default 'person',
  allocation_range daterange,
  allocation_percent numeric(5,2) not null default 100,
  hourly_rate money,
  capacity_hours numeric(8,2),
  utilization jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flow_resource_allocations_project_range_idx on public.flow_resource_allocations using gist (project_id, allocation_range);

alter table public.flow_resource_allocations enable row level security;

drop policy if exists flow_resource_allocations_project_all on public.flow_resource_allocations;
create policy flow_resource_allocations_project_all on public.flow_resource_allocations
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
