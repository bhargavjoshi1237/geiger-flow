-- Tasks abilities + ability-scoped RLS for flow.tasks
-- ---------------------------------------------------------------------------
-- Brings tasks under the same authorization model as issues (0003_abilities).
-- Also replaces the hardcoded "issues module is open" rule in flow.has_ability
-- with a data-driven flow.open_module table, so opening a module to all members
-- is an insert rather than a function edit.
--
-- Depends on 0002_tasks.sql (flow.tasks) and 0003_abilities.sql (has_ability).

create schema if not exists flow;

-- ---------------------------------------------------------------------------
-- Modules currently open to every project member regardless of role.
-- Keep in sync with OPEN_MODULES in lib/abilities.js.
-- ---------------------------------------------------------------------------

create table if not exists flow.open_module (
  module text primary key
);

-- No RLS policy: this is config read only by the security-definer has_ability
-- function (which bypasses RLS); it is not reachable through the API.
alter table flow.open_module enable row level security;

insert into flow.open_module (module) values ('issues'), ('tasks')
  on conflict (module) do nothing;

-- ---------------------------------------------------------------------------
-- Redefine has_ability to consult flow.open_module instead of a hardcoded rule.
-- ---------------------------------------------------------------------------

create or replace function flow.has_ability(target_project_id uuid, ability text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  role_key text;
  org uuid;
begin
  if uid is null then
    return false;
  end if;

  role_key := flow.project_role(target_project_id);

  -- Transitional: projects not yet linked to an organization are accessible to
  -- any authenticated user, so the app works before org provisioning is wired
  -- up. Remove once every project carries organization_id + created_by.
  if role_key is null then
    select organization_id into org
    from public.projects where id = target_project_id;

    if org is null then
      role_key := 'member';
    else
      return false;
    end if;
  end if;

  -- Owners can do anything.
  if role_key = 'owner' then
    return true;
  end if;

  -- Open modules are available to all project members.
  if exists (
    select 1 from flow.open_module om
    where om.module = split_part(ability, '.', 1)
  ) then
    return true;
  end if;

  -- Otherwise require an explicit per-role grant.
  return exists (
    select 1 from flow.role_ability ra
    where ra.organization_id = flow.project_org(target_project_id)
      and ra.role_key = role_key
      and (ra.ability = has_ability.ability or ra.ability = '*')
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Tasks RLS — ability-scoped, one policy per action.
-- Replaces the membership-only policy from 0002_tasks.sql.
-- ---------------------------------------------------------------------------

drop policy if exists tasks_member_all on flow.tasks;

drop policy if exists tasks_select on flow.tasks;
create policy tasks_select on flow.tasks
  for select using (flow.has_ability(project_id, 'tasks.view'));

drop policy if exists tasks_insert on flow.tasks;
create policy tasks_insert on flow.tasks
  for insert with check (flow.has_ability(project_id, 'tasks.create'));

drop policy if exists tasks_update on flow.tasks;
create policy tasks_update on flow.tasks
  for update
  using (flow.has_ability(project_id, 'tasks.update'))
  with check (flow.has_ability(project_id, 'tasks.update'));

drop policy if exists tasks_delete on flow.tasks;
create policy tasks_delete on flow.tasks
  for delete using (flow.has_ability(project_id, 'tasks.delete'));
