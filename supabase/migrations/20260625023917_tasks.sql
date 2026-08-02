-- Imported from 0002_tasks.sql by geiger-orm.
-- No @down section — this migration cannot be rolled back.

-- @up
-- Tasks module
-- Lives in the dedicated `flow` product schema (flow.tasks).
-- Depends on 0001_issues.sql for the `flow` schema, grants, and the shared
-- flow.set_updated_at() trigger function. References the canonical shared
-- tables (public.projects, auth.users) directly. Fully idempotent.

create extension if not exists pgcrypto;

create schema if not exists flow;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists flow.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  stage text,
  type text not null default 'task',
  progress numeric not null default 0,
  labels text[] not null default '{}'::text[],
  assignee_ids uuid[] not null default '{}'::uuid[],
  parent_link text,
  start_date date,
  due_date date,
  git_branch text,
  latest_update text,
  deadline_tracking text,
  reminders jsonb not null default '[]'::jsonb,
  role_visibility text,
  custom_fields jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.tasks to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists tasks_project_idx
  on flow.tasks (project_id, status, priority, due_date);

create index if not exists tasks_assignees_idx
  on flow.tasks using gin (assignee_ids);

create index if not exists tasks_labels_idx
  on flow.tasks using gin (labels);

-- ---------------------------------------------------------------------------
-- updated_at trigger (reuses flow.set_updated_at from 0001_issues.sql)
-- ---------------------------------------------------------------------------

drop trigger if exists tasks_set_updated_at on flow.tasks;
create trigger tasks_set_updated_at
  before update on flow.tasks
  for each row execute function flow.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- Access is scoped to members of the task's project organization.
-- ---------------------------------------------------------------------------

create or replace function flow.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.projects project
    join public.organization_users membership
      on membership.organization = project.organization_id
    where project.id = target_project_id
      and membership."user" = auth.uid()
  );
$$;

alter table flow.tasks enable row level security;

drop policy if exists tasks_member_all on flow.tasks;
create policy tasks_member_all on flow.tasks
  for all
  using (flow.can_access_project(project_id))
  with check (flow.can_access_project(project_id));
