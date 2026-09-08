-- Vault module
--
-- Owns flow.vault_items: project-scoped secrets (passwords, API keys,
-- certificates...) with the reveal/access-control configuration kept in the
-- metadata expansion bag. Self-contained and idempotent.

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

create table if not exists flow.vault_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  -- password | api_key | database | oauth | smtp | certificate | ssh_key | other
  type text not null default 'other',
  username text,
  url text,
  notes text,
  -- Expansion bag: the secret value and its accessSetup ({ method, pin,
  -- password, sessionMinutes }) live here.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.vault_items to anon, authenticated, service_role;

create index if not exists vault_items_project_idx
  on flow.vault_items (project_id, type);

drop trigger if exists vault_items_touch_updated_at on flow.vault_items;
create trigger vault_items_touch_updated_at
  before update on flow.vault_items
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('vault')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.vault_items enable row level security;

drop policy if exists vault_items_select on flow.vault_items;
create policy vault_items_select on flow.vault_items
  for select using (flow.has_ability(project_id, 'vault.view'));

drop policy if exists vault_items_insert on flow.vault_items;
create policy vault_items_insert on flow.vault_items
  for insert with check (flow.has_ability(project_id, 'vault.create'));

drop policy if exists vault_items_update on flow.vault_items;
create policy vault_items_update on flow.vault_items
  for update
  using (flow.has_ability(project_id, 'vault.update'))
  with check (flow.has_ability(project_id, 'vault.update'));

drop policy if exists vault_items_delete on flow.vault_items;
create policy vault_items_delete on flow.vault_items
  for delete using (flow.has_ability(project_id, 'vault.delete'));

-- @down
drop table if exists flow.vault_items cascade;

delete from flow.open_module where module = 'vault';
