create table if not exists public.flow_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  level text not null default 'info',
  source text not null,
  message text not null,
  trace_id text,
  span_id text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists flow_logs_project_time_idx on public.flow_logs (project_id, occurred_at desc);
create index if not exists flow_logs_payload_idx on public.flow_logs using gin (payload);

alter table public.flow_logs enable row level security;

drop policy if exists flow_logs_project_select on public.flow_logs;
create policy flow_logs_project_select on public.flow_logs
for select using (public.flow_is_project_member(project_id));
