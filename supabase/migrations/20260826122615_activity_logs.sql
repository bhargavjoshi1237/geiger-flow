-- Activity logs
--
-- Owns flow.activity_logs: append-only audit trail of project activity written
-- best-effort by the feature data layers (tasks, issues, milestones, goals,
-- objectives, vault, time entries) and rendered read-only on the Logs screen.
-- Self-contained and idempotent.

-- @up
create extension if not exists pgcrypto;
create schema if not exists flow;
grant usage on schema flow to anon, authenticated, service_role;

create table if not exists flow.activity_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  -- info | warning | error | debug
  level text not null default 'info',
  -- emitting feature module, e.g. 'tasks' | 'issues' | 'vault' ('app' default)
  source text not null default 'app',
  -- who triggered the event: user id or email when resolvable
  actor text,
  message text not null,
  -- structured payload rendered as pretty JSON by the log detail sheet
  detail jsonb,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_logs_project_occurred_idx
  on flow.activity_logs (project_id, occurred_at desc);

drop trigger if exists activity_logs_touch_updated_at on flow.activity_logs;
create trigger activity_logs_touch_updated_at
before update on flow.activity_logs
for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('activity')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action. Logs are
-- append-only from the app's perspective, so a hard-delete policy is correct.

alter table flow.activity_logs enable row level security;

drop policy if exists activity_logs_select on flow.activity_logs;
create policy activity_logs_select on flow.activity_logs
  for select using (flow.has_ability(project_id, 'activity.view'));

drop policy if exists activity_logs_insert on flow.activity_logs;
create policy activity_logs_insert on flow.activity_logs
  for insert with check (flow.has_ability(project_id, 'activity.create'));

drop policy if exists activity_logs_delete on flow.activity_logs;
create policy activity_logs_delete on flow.activity_logs
  for delete using (flow.has_ability(project_id, 'activity.delete'));

-- @down
drop table if exists flow.activity_logs cascade;

delete from flow.open_module where module = 'activity';
