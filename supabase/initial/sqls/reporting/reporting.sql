create table if not exists public.flow_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  view text not null,
  date_range daterange,
  filters jsonb not null default '{}'::jsonb,
  rows jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  generated_by uuid references auth.users(id) on delete set null,
  generated_at timestamptz not null default now()
);

create index if not exists flow_reports_project_view_idx on public.flow_reports (project_id, view, generated_at desc);

alter table public.flow_reports enable row level security;

drop policy if exists flow_reports_project_all on public.flow_reports;
create policy flow_reports_project_all on public.flow_reports
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
