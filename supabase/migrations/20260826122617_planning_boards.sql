-- Planning module
--
-- Owns flow.planning_boards: one live react-flow board per project (nodes,
-- edges, canvas viewport). The metadata jsonb bag carries not-yet-promoted
-- workspace config (planning file list / active file) alongside the graph.
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

create table if not exists flow.planning_boards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  -- react-flow node/edge arrays serialized as-is
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  -- { x, y, zoom } canvas transform; null until the user moves the viewport
  viewport jsonb,
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.planning_boards to anon, authenticated, service_role;

create index if not exists planning_boards_project_idx
  on flow.planning_boards (project_id);

-- One live board per project (soft-deleted rows free the slot again).
create unique index if not exists planning_boards_project_uniq
  on flow.planning_boards (project_id)
  where deleted_at is null;

drop trigger if exists planning_boards_touch_updated_at on flow.planning_boards;
create trigger planning_boards_touch_updated_at
  before update on flow.planning_boards
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('planning')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.planning_boards enable row level security;

drop policy if exists planning_boards_select on flow.planning_boards;
create policy planning_boards_select on flow.planning_boards
  for select using (flow.has_ability(project_id, 'planning.view'));

drop policy if exists planning_boards_insert on flow.planning_boards;
create policy planning_boards_insert on flow.planning_boards
  for insert with check (flow.has_ability(project_id, 'planning.update'));

drop policy if exists planning_boards_update on flow.planning_boards;
create policy planning_boards_update on flow.planning_boards
  for update
  using (flow.has_ability(project_id, 'planning.update'))
  with check (flow.has_ability(project_id, 'planning.update'));

drop policy if exists planning_boards_delete on flow.planning_boards;
create policy planning_boards_delete on flow.planning_boards
  for delete using (flow.has_ability(project_id, 'planning.update'));

-- @down
drop table if exists flow.planning_boards cascade;

delete from flow.open_module where module = 'planning';
