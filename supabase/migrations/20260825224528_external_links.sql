-- External links module
--
-- Owns flow.external_links: project-scoped shortcut links shown on the project
-- topbar and dashboard. Display options (color, visibility, target) live in the
-- metadata expansion bag. Replaces the previous localStorage-only storage.
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

create table if not exists flow.external_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  url text not null,
  -- lucide icon name rendered by ExternalLinkIcon
  icon text not null default 'ExternalLink',
  -- Expansion bag: { textColor, showOnTopbar, showOnDashboard, openInNewTab }
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.external_links to anon, authenticated, service_role;

create index if not exists external_links_project_idx
  on flow.external_links (project_id, created_at desc);

drop trigger if exists external_links_touch_updated_at on flow.external_links;
create trigger external_links_touch_updated_at
  before update on flow.external_links
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('external_links')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.external_links enable row level security;

drop policy if exists external_links_select on flow.external_links;
create policy external_links_select on flow.external_links
  for select using (flow.has_ability(project_id, 'external_links.view'));

drop policy if exists external_links_insert on flow.external_links;
create policy external_links_insert on flow.external_links
  for insert with check (flow.has_ability(project_id, 'external_links.create'));

drop policy if exists external_links_update on flow.external_links;
create policy external_links_update on flow.external_links
  for update
  using (flow.has_ability(project_id, 'external_links.update'))
  with check (flow.has_ability(project_id, 'external_links.update'));

drop policy if exists external_links_delete on flow.external_links;
create policy external_links_delete on flow.external_links
  for delete using (flow.has_ability(project_id, 'external_links.delete'));

-- @down
drop table if exists flow.external_links cascade;

delete from flow.open_module where module = 'external_links';
