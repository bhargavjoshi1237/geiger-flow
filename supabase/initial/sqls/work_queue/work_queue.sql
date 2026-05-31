create table if not exists public.flow_work_queue_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  title text not null,
  description text,
  status text not null default 'queued',
  priority smallint not null default 0,
  assignee_id uuid references auth.users(id) on delete set null,
  queue_position integer,
  scheduled_for timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flow_work_queue_project_status_idx on public.flow_work_queue_items (project_id, status, priority desc);

alter table public.flow_work_queue_items enable row level security;

drop policy if exists flow_work_queue_items_project_all on public.flow_work_queue_items;
create policy flow_work_queue_items_project_all on public.flow_work_queue_items
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
