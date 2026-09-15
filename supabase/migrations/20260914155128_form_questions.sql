-- Form questions
--
-- Owns flow.form_questions: one row per question in a flow.forms form,
-- ordered by position. Shares the 'forms' ability module with its parent so
-- one RLS family covers list + builder. Runs after the forms migration.

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

create table if not exists flow.form_questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  form_id uuid not null references flow.forms(id) on delete cascade,
  title text not null default 'Untitled question',
  -- 'short' | 'paragraph' | 'multiple' | 'checkbox' | 'dropdown'
  type text not null default 'short',
  description text not null default '',
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.form_questions to anon, authenticated, service_role;

create index if not exists form_questions_form_idx
  on flow.form_questions (form_id, position);

create index if not exists form_questions_project_idx
  on flow.form_questions (project_id);

create index if not exists form_questions_live_idx
  on flow.form_questions (id)
  where deleted_at is null;

drop trigger if exists form_questions_touch_updated_at on flow.form_questions;
create trigger form_questions_touch_updated_at
  before update on flow.form_questions
  for each row execute function flow.touch_updated_at();

-- Same 'forms' module as the parent table (idempotent re-insert).

insert into flow.open_module (module) values ('forms')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.form_questions enable row level security;

drop policy if exists form_questions_select on flow.form_questions;
create policy form_questions_select on flow.form_questions
  for select using (flow.has_ability(project_id, 'forms.view'));

drop policy if exists form_questions_insert on flow.form_questions;
create policy form_questions_insert on flow.form_questions
  for insert with check (flow.has_ability(project_id, 'forms.create'));

drop policy if exists form_questions_update on flow.form_questions;
create policy form_questions_update on flow.form_questions
  for update
  using (flow.has_ability(project_id, 'forms.update'))
  with check (flow.has_ability(project_id, 'forms.update'));

drop policy if exists form_questions_delete on flow.form_questions;
create policy form_questions_delete on flow.form_questions
  for delete using (flow.has_ability(project_id, 'forms.delete'));

-- @down
drop table if exists flow.form_questions cascade;
-- Keep the 'forms' open_module row while flow.forms still owns it.
