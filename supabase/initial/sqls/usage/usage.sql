create table if not exists public.flow_usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  metric text not null,
  quantity numeric(18,6) not null default 1,
  unit text not null default 'count',
  dimensions jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create index if not exists flow_usage_events_org_metric_idx on public.flow_usage_events (organization_id, metric, recorded_at desc);

alter table public.flow_usage_events enable row level security;

drop policy if exists flow_usage_events_scope_select on public.flow_usage_events;
create policy flow_usage_events_scope_select on public.flow_usage_events
for select using ((organization_id is not null and public.flow_is_org_member(organization_id)) or (project_id is not null and public.flow_is_project_member(project_id)));
