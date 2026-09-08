-- Projections module
--
-- Owns flow.projections: dated project events (milestones, releases, reviews,
-- deadlines...) rendered on the project calendar. Each row has a free-form
-- `kind` label, an optional multi-day span (starts_on .. ends_on), a
-- public/shared visibility and a soft archive flag. Self-contained and
-- idempotent.

-- @up
create extension if not exists pgcrypto;
create schema if not exists flow;
grant usage on schema flow to anon, authenticated, service_role;

-- Shared "touch updated_at" trigger function (suite convention). Defined here
-- so this migration never depends on another having run first.
create or replace function flow.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists flow.projections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  -- free-form label (milestone / release / review / deadline ...)
  kind text not null default 'milestone',
  starts_on date not null default current_date,
  -- nullable: a projection may be a single day (starts_on only)
  ends_on date,
  -- 'public' | 'shared'
  visibility text not null default 'public',
  -- null = active; set = archived
  archived_at timestamptz,
  owner text,
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.projections to anon, authenticated, service_role;

create index if not exists projections_project_idx
  on flow.projections (project_id, starts_on);

drop trigger if exists projections_touch_updated_at on flow.projections;
create trigger projections_touch_updated_at
before update on flow.projections
for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('projections')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.projections enable row level security;

drop policy if exists projections_select on flow.projections;
create policy projections_select on flow.projections
  for select using (flow.has_ability(project_id, 'projections.view'));

drop policy if exists projections_insert on flow.projections;
create policy projections_insert on flow.projections
  for insert with check (flow.has_ability(project_id, 'projections.create'));

drop policy if exists projections_update on flow.projections;
create policy projections_update on flow.projections
  for update
  using (flow.has_ability(project_id, 'projections.update'))
  with check (flow.has_ability(project_id, 'projections.update'));

drop policy if exists projections_delete on flow.projections;
create policy projections_delete on flow.projections
  for delete using (flow.has_ability(project_id, 'projections.delete'));

-- @down
drop table if exists flow.projections cascade;

delete from flow.open_module where module = 'projections';
