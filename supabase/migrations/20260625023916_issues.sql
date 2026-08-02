-- Imported from 0001_issues.sql by geiger-orm.
-- No @down section — this migration cannot be rolled back.

-- @up
-- Issues module
-- Lives in the dedicated `flow` product schema.
-- References the canonical shared tables (public.projects, public.organization_users,
-- auth.users) directly. Fully idempotent and self-contained.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Schema
-- ---------------------------------------------------------------------------

create schema if not exists flow;

-- Expose the schema to the PostgREST roles. (You must also add `flow` to
-- Settings -> API -> Exposed schemas in the Supabase dashboard for the API
-- to serve it.)
grant usage on schema flow to anon, authenticated, service_role;
alter default privileges in schema flow
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema flow
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema flow
  grant all on functions to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists flow.issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open',
  priority text not null default 'medium',
  labels text[] not null default '{}'::text[],
  assignee_ids uuid[] not null default '{}'::uuid[],
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flow.issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references flow.issues(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.issues to anon, authenticated, service_role;
grant all on flow.issue_comments to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists issues_project_idx
  on flow.issues (project_id, status, priority, due_date);

create index if not exists issues_assignees_idx
  on flow.issues using gin (assignee_ids);

create index if not exists issues_labels_idx
  on flow.issues using gin (labels);

create index if not exists issue_comments_issue_idx
  on flow.issue_comments (issue_id, created_at);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create or replace function flow.set_updated_at()
returns trigger
language plpgsql
set search_path = flow
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists issues_set_updated_at on flow.issues;
create trigger issues_set_updated_at
  before update on flow.issues
  for each row execute function flow.set_updated_at();

drop trigger if exists issue_comments_set_updated_at on flow.issue_comments;
create trigger issue_comments_set_updated_at
  before update on flow.issue_comments
  for each row execute function flow.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- Access is scoped to members of the issue's project organization.
-- ---------------------------------------------------------------------------

create or replace function flow.can_access_issue_project(target_project_id uuid)
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

alter table flow.issues enable row level security;
alter table flow.issue_comments enable row level security;

drop policy if exists issues_member_all on flow.issues;
create policy issues_member_all on flow.issues
  for all
  using (flow.can_access_issue_project(project_id))
  with check (flow.can_access_issue_project(project_id));

drop policy if exists issue_comments_member_all on flow.issue_comments;
create policy issue_comments_member_all on flow.issue_comments
  for all
  using (
    exists (
      select 1 from flow.issues issue
      where issue.id = issue_id
        and flow.can_access_issue_project(issue.project_id)
    )
  )
  with check (
    exists (
      select 1 from flow.issues issue
      where issue.id = issue_id
        and flow.can_access_issue_project(issue.project_id)
    )
  );
