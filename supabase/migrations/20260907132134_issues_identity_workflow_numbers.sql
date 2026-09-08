-- Issues: Linear-grade identity + workflow states.
--
-- Owns: flow.issues.number, flow.project_issue_counters,
-- flow.next_issue_number(uuid), issues_project_number_idx, issues_status_idx.
--
-- Supersedes 20260907131628_issues_identity_workflow.sql, which was applied
-- as an empty scaffold (no-op) and is intentionally left untouched.
--
-- Identity: per-project sequential numbers. The human-readable identifier
-- (e.g. FLOW-123) is built client-side from the project key + number
-- (see features/issues/constants.js → issueIdentifier).
--
-- Workflow: the status set grows from (open, in_progress, resolved) to
-- (backlog, todo, in_progress, done, canceled, duplicate). Legacy mapping:
--   open -> todo, resolved -> done (in_progress is unchanged).
-- Deliberately NO CHECK constraint on status, so any pre-existing value keeps
-- reading and old clients keep writing without a hard failure.
--
-- Depends on 20260625023916_issues.sql (flow.issues). Idempotent.

-- @up

create schema if not exists flow;

grant usage on schema flow to anon, authenticated, service_role;

alter table flow.issues add column if not exists number integer;

-- Per-project atomic counters backing flow.next_issue_number().
create table if not exists flow.project_issue_counters (
  project_id uuid primary key references public.projects(id) on delete cascade,
  last_number integer not null default 0
);

grant all on table flow.project_issue_counters to anon, authenticated, service_role;
grant all on flow.issues to anon, authenticated, service_role;

-- Counters are written only via the security-definer function below, so RLS
-- exposes reads and no direct writes.
alter table flow.project_issue_counters enable row level security;
drop policy if exists project_issue_counters_read on flow.project_issue_counters;
create policy project_issue_counters_read on flow.project_issue_counters
  for select to anon, authenticated
  using (true);

-- Atomically reserves the next per-project issue number. Serialized per
-- project with a transaction-scoped advisory lock and clamped to at least
-- MAX(number)+1 so rows inserted without the counter can never collide.
create or replace function flow.next_issue_number(p_project_id uuid)
returns integer
language plpgsql
security definer
set search_path = flow, public
as $$
declare
  v_max integer;
  v_next integer;
begin
  if p_project_id is null then
    raise exception 'next_issue_number: project id is required';
  end if;

  perform pg_advisory_xact_lock(hashtext('flow_issue_number:' || p_project_id::text));

  select coalesce(max(number), 0) into v_max
  from flow.issues
  where project_id = p_project_id;

  insert into flow.project_issue_counters (project_id, last_number)
  values (p_project_id, v_max + 1)
  on conflict (project_id) do update
    set last_number = greatest(flow.project_issue_counters.last_number + 1, excluded.last_number)
  returning last_number into v_next;

  return v_next;
end;
$$;

grant execute on function flow.next_issue_number(uuid) to anon, authenticated, service_role;

-- Backfill per-project numbers ordered by creation time.
update flow.issues as issue
set number = ranked.rn
from (
  select id, row_number() over (
    partition by project_id order by created_at asc, id asc
  ) as rn
  from flow.issues
  where number is null
) as ranked
where issue.id = ranked.id;

-- Sync counters with the backfilled maxima.
insert into flow.project_issue_counters (project_id, last_number)
select project_id, max(number)
from flow.issues
where number is not null
group by project_id
on conflict (project_id) do update
  set last_number = greatest(flow.project_issue_counters.last_number, excluded.last_number);

-- Legacy workflow mapping: open -> todo, resolved -> done.
update flow.issues set status = 'todo' where status = 'open';
update flow.issues set status = 'done' where status = 'resolved';

create unique index if not exists issues_project_number_idx
  on flow.issues (project_id, number);
create index if not exists issues_status_idx
  on flow.issues (status);

-- @down

-- Status values are intentionally NOT reverted: flipping user data back would
-- be destructive, and the new set reads fine without a constraint.
drop index if exists flow.issues_project_number_idx;
drop index if exists flow.issues_status_idx;
drop function if exists flow.next_issue_number(uuid);
drop table if exists flow.project_issue_counters;
alter table flow.issues drop column if exists number;
