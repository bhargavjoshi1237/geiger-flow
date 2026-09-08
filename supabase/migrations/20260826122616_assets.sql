-- Assets module
--
-- Owns flow.assets: files uploaded to a project's digital-asset library.
-- Binary content lives in the public `homeboard` storage bucket under
-- `project-assets/<project_id>/`; the row persists the PUBLIC url plus the
-- storage path so the object can be removed when the asset is deleted.
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

create table if not exists flow.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  -- image | video | document | audio | archive | other
  media_type text not null default 'other',
  size_bytes bigint not null default 0,
  -- persisted PUBLIC storage url (rendered directly by the UI)
  url text,
  -- bucket path, kept so the object can be cleaned up on delete
  storage_path text,
  tags _text not null default '{}',
  owner text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.assets to anon, authenticated, service_role;

create index if not exists assets_project_idx
  on flow.assets (project_id, created_at desc);

drop trigger if exists assets_touch_updated_at on flow.assets;
create trigger assets_touch_updated_at
  before update on flow.assets
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('assets')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.assets enable row level security;

drop policy if exists assets_select on flow.assets;
create policy assets_select on flow.assets
  for select using (flow.has_ability(project_id, 'assets.view'));

drop policy if exists assets_insert on flow.assets;
create policy assets_insert on flow.assets
  for insert with check (flow.has_ability(project_id, 'assets.create'));

drop policy if exists assets_update on flow.assets;
create policy assets_update on flow.assets
  for update
  using (flow.has_ability(project_id, 'assets.update'))
  with check (flow.has_ability(project_id, 'assets.update'));

drop policy if exists assets_delete on flow.assets;
create policy assets_delete on flow.assets
  for delete using (flow.has_ability(project_id, 'assets.delete'));

-- @down
drop table if exists flow.assets cascade;

delete from flow.open_module where module = 'assets';
