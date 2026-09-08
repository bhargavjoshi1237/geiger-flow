-- Issue hierarchy (parent_id) + directed issue links (blocks/related/duplicate)
--
-- Owns flow.issues.parent_id and flow.issue_links. The sibling agent adding
-- `number` + new statuses owns those objects — this file only touches
-- parent_id / issue_links and uses IF NOT EXISTS throughout so pushes commute.

-- @up
create extension if not exists pgcrypto;
create schema if not exists flow;
grant usage on schema flow to anon, authenticated, service_role;

-- Hierarchy: a sub-issue points at its parent; deleting the parent orphans
-- (set null) rather than cascading the delete.
alter table flow.issues
  add column if not exists parent_id uuid references flow.issues(id) on delete set null;

create index if not exists issues_parent_idx
  on flow.issues (parent_id) where deleted_at is null;

-- Directed links between issues in the same project:
--   blocks   — source blocks target (target's "blocked by" is derived)
--   related  — symmetric association (stored once, read both directions)
--   duplicate — source is a duplicate of target
create table if not exists flow.issue_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_id uuid not null references flow.issues(id) on delete cascade,
  target_id uuid not null references flow.issues(id) on delete cascade,
  kind text not null default 'related',
  created_by uuid,
  created_at timestamptz not null default now(),
  check (kind in ('blocks', 'related', 'duplicate')),
  check (source_id <> target_id)
);

grant all on flow.issue_links to anon, authenticated, service_role;

create index if not exists issue_links_source_idx on flow.issue_links (source_id);
create index if not exists issue_links_target_idx on flow.issue_links (target_id);
create index if not exists issue_links_project_idx on flow.issue_links (project_id);
create unique index if not exists issue_links_unique_idx
  on flow.issue_links (source_id, target_id, kind);

alter table flow.issue_links enable row level security;

drop policy if exists issue_links_member_all on flow.issue_links;
create policy issue_links_member_all on flow.issue_links
  for all
  using (flow.can_access_issue_project(project_id))
  with check (flow.can_access_issue_project(project_id));

-- @down
drop policy if exists issue_links_member_all on flow.issue_links;
drop table if exists flow.issue_links cascade;
drop index if exists flow.issues_parent_idx;
alter table flow.issues drop column if exists parent_id;
