-- Decisions module
--
-- Owns flow.decisions: the decision memory — what was decided, why, who owns
-- the consequences and when to revisit. Self-contained and idempotent.

-- @up
create extension if not exists pgcrypto;
create schema if not exists flow;
grant usage on schema flow to anon, authenticated, service_role;

create or replace function flow.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists flow.decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  -- the driver/context behind the decision
  rationale text,
  -- proposed | accepted | revisit | superseded
  status text not null default 'proposed',
  owner text,
  -- reversible | one_way
  reversibility text not null default 'reversible',
  review_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.decisions to anon, authenticated, service_role;

create index if not exists decisions_project_idx
  on flow.decisions (project_id, status);

drop trigger if exists decisions_touch_updated_at on flow.decisions;
create trigger decisions_touch_updated_at
  before update on flow.decisions
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('decisions')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.decisions enable row level security;

drop policy if exists decisions_select on flow.decisions;
create policy decisions_select on flow.decisions
  for select using (flow.has_ability(project_id, 'decisions.view'));

drop policy if exists decisions_insert on flow.decisions;
create policy decisions_insert on flow.decisions
  for insert with check (flow.has_ability(project_id, 'decisions.create'));

drop policy if exists decisions_update on flow.decisions;
create policy decisions_update on flow.decisions
  for update
  using (flow.has_ability(project_id, 'decisions.update'))
  with check (flow.has_ability(project_id, 'decisions.update'));

drop policy if exists decisions_delete on flow.decisions;
create policy decisions_delete on flow.decisions
  for delete using (flow.has_ability(project_id, 'decisions.delete'));

-- @down
drop table if exists flow.decisions cascade;

delete from flow.open_module where module = 'decisions';
