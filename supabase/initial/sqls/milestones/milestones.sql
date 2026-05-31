create table if not exists public.flow_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'planned',
  priority text not null default 'medium',
  starts_on date,
  due_on date,
  completed_on date,
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  dependencies uuid[] not null default array[]::uuid[],
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.flow_milestones add column if not exists project_id uuid references public.flow_projects(id) on delete cascade;
alter table public.flow_milestones add column if not exists description text;
alter table public.flow_milestones add column if not exists status text not null default 'planned';
alter table public.flow_milestones add column if not exists priority text not null default 'medium';
alter table public.flow_milestones add column if not exists starts_on date;
alter table public.flow_milestones add column if not exists due_on date;
alter table public.flow_milestones add column if not exists completed_on date;
alter table public.flow_milestones add column if not exists progress smallint not null default 0;
alter table public.flow_milestones add column if not exists dependencies uuid[] not null default array[]::uuid[];
alter table public.flow_milestones add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.flow_milestones add column if not exists updated_at timestamptz not null default now();
update public.flow_milestones set project_id = project where project_id is null and project is not null;

create index if not exists flow_milestones_project_due_idx on public.flow_milestones (project_id, due_on, status);

alter table public.flow_milestones enable row level security;

drop policy if exists flow_milestones_project_all on public.flow_milestones;
create policy flow_milestones_project_all on public.flow_milestones
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
