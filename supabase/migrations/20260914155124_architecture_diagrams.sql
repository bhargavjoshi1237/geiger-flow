-- Architecture diagrams
--
-- Owns flow.architecture_diagrams: one live system-architecture canvas per
-- project (react-flow nodes/edges serialized as-is, viewport transform).
-- Nodes carry cost/expense fields in their data bag; the budget rollup is
-- derived in the UI and coordinated via project-budget-context (read-only).
-- Self-contained and idempotent.

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

create table if not exists flow.architecture_diagrams (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null default 'System Architecture',
  -- react-flow node/edge arrays serialized as-is
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  -- { x, y, zoom } canvas transform; null until the user moves the viewport
  viewport jsonb,
  -- Expansion bag: keep not-yet-promoted canvas config here.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.architecture_diagrams to anon, authenticated, service_role;

create index if not exists architecture_diagrams_project_idx
  on flow.architecture_diagrams (project_id);

-- One live diagram per project (soft-deleted rows free the slot again).
create unique index if not exists architecture_diagrams_project_uniq
  on flow.architecture_diagrams (project_id)
  where deleted_at is null;

drop trigger if exists architecture_diagrams_touch_updated_at on flow.architecture_diagrams;
create trigger architecture_diagrams_touch_updated_at
  before update on flow.architecture_diagrams
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js once the settings agent classifies addon abilities).

insert into flow.open_module (module) values ('architecture')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.architecture_diagrams enable row level security;

drop policy if exists architecture_diagrams_select on flow.architecture_diagrams;
create policy architecture_diagrams_select on flow.architecture_diagrams
  for select using (flow.has_ability(project_id, 'architecture.view'));

drop policy if exists architecture_diagrams_insert on flow.architecture_diagrams;
create policy architecture_diagrams_insert on flow.architecture_diagrams
  for insert with check (flow.has_ability(project_id, 'architecture.create'));

drop policy if exists architecture_diagrams_update on flow.architecture_diagrams;
create policy architecture_diagrams_update on flow.architecture_diagrams
  for update
  using (flow.has_ability(project_id, 'architecture.update'))
  with check (flow.has_ability(project_id, 'architecture.update'));

drop policy if exists architecture_diagrams_delete on flow.architecture_diagrams;
create policy architecture_diagrams_delete on flow.architecture_diagrams
  for delete using (flow.has_ability(project_id, 'architecture.delete'));

-- @down
drop table if exists flow.architecture_diagrams cascade;

delete from flow.open_module where module = 'architecture';
