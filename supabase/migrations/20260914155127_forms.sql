-- Forms
--
-- Owns flow.forms: project-scoped confidential collection spaces. Questions
-- live in flow.form_questions (one row per question, ordered by position) so
-- the list screen and the builder share the same tables via
-- features/forms/actions.js. The settings/access controls ride in the
-- settings jsonb + metadata expansion bag. Self-contained and idempotent.

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

create table if not exists flow.forms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  -- 'Draft' | 'Published' | 'Closed'
  status text not null default 'Draft',
  confidentiality text not null default 'Confidential',
  -- collection controls: { membersOnly, verifiedIdentity, notifyOwners, allowEdits }
  settings jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.forms to anon, authenticated, service_role;

create index if not exists forms_project_idx
  on flow.forms (project_id, status);

create index if not exists forms_live_idx
  on flow.forms (id)
  where deleted_at is null;

drop trigger if exists forms_touch_updated_at on flow.forms;
create trigger forms_touch_updated_at
  before update on flow.forms
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js once the settings agent classifies addon abilities).

insert into flow.open_module (module) values ('forms')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.forms enable row level security;

drop policy if exists forms_select on flow.forms;
create policy forms_select on flow.forms
  for select using (flow.has_ability(project_id, 'forms.view'));

drop policy if exists forms_insert on flow.forms;
create policy forms_insert on flow.forms
  for insert with check (flow.has_ability(project_id, 'forms.create'));

drop policy if exists forms_update on flow.forms;
create policy forms_update on flow.forms
  for update
  using (flow.has_ability(project_id, 'forms.update'))
  with check (flow.has_ability(project_id, 'forms.update'));

drop policy if exists forms_delete on flow.forms;
create policy forms_delete on flow.forms
  for delete using (flow.has_ability(project_id, 'forms.delete'));

-- @down
drop table if exists flow.forms cascade;

delete from flow.open_module where module = 'forms';
