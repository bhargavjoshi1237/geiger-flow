-- Risks module
--
-- Owns flow.risks: quantified delivery/vendor/security/scope risks with
-- probability, impact, mitigation owner and review date. Exposure is derived
-- in the UI from probability x impact. Self-contained and idempotent.

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

create table if not exists flow.risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  -- open | mitigating | watching | closed
  status text not null default 'open',
  owner text,
  -- 0-100 likelihood, updated during weekly planning
  probability integer not null default 50,
  -- low | medium | high
  impact text not null default 'medium',
  mitigation text,
  review_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.risks to anon, authenticated, service_role;

create index if not exists risks_project_idx
  on flow.risks (project_id, status);

drop trigger if exists risks_touch_updated_at on flow.risks;
create trigger risks_touch_updated_at
  before update on flow.risks
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('risks')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.risks enable row level security;

drop policy if exists risks_select on flow.risks;
create policy risks_select on flow.risks
  for select using (flow.has_ability(project_id, 'risks.view'));

drop policy if exists risks_insert on flow.risks;
create policy risks_insert on flow.risks
  for insert with check (flow.has_ability(project_id, 'risks.create'));

drop policy if exists risks_update on flow.risks;
create policy risks_update on flow.risks
  for update
  using (flow.has_ability(project_id, 'risks.update'))
  with check (flow.has_ability(project_id, 'risks.update'));

drop policy if exists risks_delete on flow.risks;
create policy risks_delete on flow.risks
  for delete using (flow.has_ability(project_id, 'risks.delete'));

-- @down
drop table if exists flow.risks cascade;

delete from flow.open_module where module = 'risks';
