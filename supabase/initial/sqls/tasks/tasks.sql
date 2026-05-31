create table if not exists public.flow_task_collections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  slug citext not null,
  description text,
  color text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, slug)
);

create table if not exists public.flow_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  collection_id uuid references public.flow_task_collections(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done', 'archived')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  stage text not null default 'backlog',
  type text not null default 'task',
  progress smallint not null default 0 check (progress >= 0 and progress <= 100),
  labels text[] not null default array[]::text[],
  assignee_ids uuid[] not null default array[]::uuid[],
  parent_type text,
  parent_id uuid,
  parent_link text,
  milestone_id uuid,
  objective_id uuid,
  goal_id uuid,
  initiative_link text,
  start_date date,
  due_date date,
  time_block tstzrange,
  estimate interval,
  deadline_tracking text not null default 'on_track',
  git_branch text,
  git_refs text[] not null default array[]::text[],
  reminders text[] not null default array[]::text[],
  role_visibility text not null default 'team',
  inbox jsonb not null default '{}'::jsonb,
  integrations jsonb not null default '{}'::jsonb,
  assist_panel jsonb not null default '{}'::jsonb,
  latest_update text,
  custom_fields jsonb not null default '{}'::jsonb,
  search_vector tsvector not null default ''::tsvector,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  archived_at timestamptz
);

create table if not exists public.flow_task_dependencies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.flow_tasks(id) on delete cascade,
  dependency_type text not null default 'blocks',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (task_id, depends_on_task_id)
);

create table if not exists public.flow_task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  body text not null,
  mentions uuid[] not null default array[]::uuid[],
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.flow_task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  message text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create index if not exists flow_tasks_project_status_idx on public.flow_tasks (project_id, status, due_date);
create index if not exists flow_tasks_assignees_idx on public.flow_tasks using gin (assignee_ids);
create index if not exists flow_tasks_labels_idx on public.flow_tasks using gin (labels);
create index if not exists flow_tasks_search_idx on public.flow_tasks using gin (search_vector);
create index if not exists flow_task_activity_task_idx on public.flow_task_activity (task_id, created_at desc);

alter table public.flow_task_collections enable row level security;
alter table public.flow_tasks enable row level security;
alter table public.flow_task_dependencies enable row level security;
alter table public.flow_task_comments enable row level security;
alter table public.flow_task_activity enable row level security;

drop policy if exists flow_task_collections_project_all on public.flow_task_collections;
create policy flow_task_collections_project_all on public.flow_task_collections
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_tasks_project_all on public.flow_tasks;
create policy flow_tasks_project_all on public.flow_tasks
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_task_dependencies_project_all on public.flow_task_dependencies;
create policy flow_task_dependencies_project_all on public.flow_task_dependencies
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_task_comments_project_all on public.flow_task_comments;
create policy flow_task_comments_project_all on public.flow_task_comments
for all using (exists (select 1 from public.flow_tasks task where task.id = task_id and public.flow_is_project_member(task.project_id)))
with check (exists (select 1 from public.flow_tasks task where task.id = task_id and public.flow_is_project_member(task.project_id)));

drop policy if exists flow_task_activity_project_select on public.flow_task_activity;
create policy flow_task_activity_project_select on public.flow_task_activity
for select using (exists (select 1 from public.flow_tasks task where task.id = task_id and public.flow_is_project_member(task.project_id)));
