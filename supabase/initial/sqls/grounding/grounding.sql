create table if not exists public.flow_grounding_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  source_type text not null,
  uri text,
  trust_level numeric(5,2) not null default 0,
  refresh_interval interval,
  last_synced_at timestamptz,
  schema_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flow_grounding_sources_project_idx on public.flow_grounding_sources (project_id, source_type);

alter table public.flow_grounding_sources enable row level security;

drop policy if exists flow_grounding_sources_project_all on public.flow_grounding_sources;
create policy flow_grounding_sources_project_all on public.flow_grounding_sources
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
