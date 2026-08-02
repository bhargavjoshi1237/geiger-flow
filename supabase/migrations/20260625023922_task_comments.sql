-- Imported from 0007_task_comments.sql by geiger-orm.
-- No @down section — this migration cannot be rolled back.

-- @up
-- Task comments
-- Mirrors flow.issue_comments (0001_issues.sql) and its ability-scoped RLS
-- (0003_abilities.sql), but bound to the tasks module via 'tasks.comment'.
--
-- Depends on 0002_tasks.sql (flow.tasks), 0001_issues.sql (flow.set_updated_at)
-- and 0003_abilities.sql (flow.has_ability). Fully idempotent.

create extension if not exists pgcrypto;
create schema if not exists flow;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists flow.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references flow.tasks(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.task_comments to anon, authenticated, service_role;

create index if not exists task_comments_task_idx
  on flow.task_comments (task_id, created_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger (reuses flow.set_updated_at from 0001_issues.sql)
-- ---------------------------------------------------------------------------

drop trigger if exists task_comments_set_updated_at on flow.task_comments;
create trigger task_comments_set_updated_at
  before update on flow.task_comments
  for each row execute function flow.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security — comments inherit their parent task's project abilities.
-- ---------------------------------------------------------------------------

alter table flow.task_comments enable row level security;

drop policy if exists task_comments_select on flow.task_comments;
create policy task_comments_select on flow.task_comments
  for select using (
    exists (
      select 1 from flow.tasks t
      where t.id = task_id and flow.has_ability(t.project_id, 'tasks.view')
    )
  );

drop policy if exists task_comments_insert on flow.task_comments;
create policy task_comments_insert on flow.task_comments
  for insert with check (
    exists (
      select 1 from flow.tasks t
      where t.id = task_id and flow.has_ability(t.project_id, 'tasks.comment')
    )
  );

drop policy if exists task_comments_update on flow.task_comments;
create policy task_comments_update on flow.task_comments
  for update using (
    exists (
      select 1 from flow.tasks t
      where t.id = task_id and flow.has_ability(t.project_id, 'tasks.comment')
    )
  )
  with check (
    exists (
      select 1 from flow.tasks t
      where t.id = task_id and flow.has_ability(t.project_id, 'tasks.comment')
    )
  );

drop policy if exists task_comments_delete on flow.task_comments;
create policy task_comments_delete on flow.task_comments
  for delete using (
    exists (
      select 1 from flow.tasks t
      where t.id = task_id and flow.has_ability(t.project_id, 'tasks.comment')
    )
  );
