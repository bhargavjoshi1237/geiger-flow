-- Abilities (role-based action authorization)
-- ---------------------------------------------------------------------------
-- Classifies user actions as "abilities" (e.g. issues.create) that a role may
-- be granted, and enforces them in RLS via flow.has_ability(project_id, key).
--
-- Resolution model:
--   * flow.project_role(project)  -> the caller's role for a project
--     ('owner' for the project/org creator, else their organization_users role)
--   * flow.role_ability           -> explicit (organization, role, ability) grants
--   * flow.has_ability(project, a) -> owner can do anything; the issues module is
--     currently open to all members; otherwise an explicit grant is required.
--
-- Depends on 0001_issues.sql (flow schema + flow.issues / flow.issue_comments).

create schema if not exists flow;

-- ---------------------------------------------------------------------------
-- Resolver functions (security definer so policies can read the shared tables
-- regardless of their own RLS).
-- ---------------------------------------------------------------------------

create or replace function flow.project_org(target_project_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.projects where id = target_project_id;
$$;

create or replace function flow.project_role(target_project_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  org uuid;
  creator uuid;
  member_role text;
begin
  if uid is null then
    return null;
  end if;

  select organization_id, created_by
  into org, creator
  from public.projects
  where id = target_project_id;

  -- Project creator is treated as an owner.
  if creator is not null and creator = uid then
    return 'owner';
  end if;

  if org is not null then
    select lower(ou.role::text)
    into member_role
    from public.organization_users ou
    where ou."user" = uid and ou.organization = org
    limit 1;

    if member_role is not null then
      return member_role;
    end if;

    -- Organization creator is treated as an owner.
    if exists (
      select 1 from public.organizations o
      where o.id = org and o.created_by = uid
    ) then
      return 'owner';
    end if;
  end if;

  return null;
end;
$$;

create or replace function flow.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.organization_users
    where "user" = auth.uid() and organization = target_org
  ) or exists (
    select 1 from public.organizations
    where id = target_org and created_by = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Per-role ability grants. Empty until actions are classified; the resolver
-- below decides defaults while a module is still "open".
-- ---------------------------------------------------------------------------

create table if not exists flow.role_ability (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_key text not null,
  ability text not null,
  created_at timestamptz not null default now(),
  primary key (organization_id, role_key, ability)
);

grant all on flow.role_ability to anon, authenticated, service_role;

alter table flow.role_ability enable row level security;

drop policy if exists role_ability_read on flow.role_ability;
create policy role_ability_read on flow.role_ability
  for select
  using (flow.is_org_member(organization_id));

drop policy if exists role_ability_write on flow.role_ability;
create policy role_ability_write on flow.role_ability
  for all
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.created_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- The core check. Keep the "open module" rules in sync with lib/abilities.js.
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

  -- Issues module is currently open to all project members.
  if ability like 'issues.%' then
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

grant execute on function flow.project_org(uuid) to anon, authenticated, service_role;
grant execute on function flow.project_role(uuid) to anon, authenticated, service_role;
grant execute on function flow.is_org_member(uuid) to anon, authenticated, service_role;
grant execute on function flow.has_ability(uuid, text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Issues RLS — ability-scoped, one policy per action.
-- Replaces the membership-only policy from 0001_issues.sql.
-- ---------------------------------------------------------------------------

drop policy if exists issues_member_all on flow.issues;

drop policy if exists issues_select on flow.issues;
create policy issues_select on flow.issues
  for select using (flow.has_ability(project_id, 'issues.view'));

drop policy if exists issues_insert on flow.issues;
create policy issues_insert on flow.issues
  for insert with check (flow.has_ability(project_id, 'issues.create'));

drop policy if exists issues_update on flow.issues;
create policy issues_update on flow.issues
  for update
  using (flow.has_ability(project_id, 'issues.update'))
  with check (flow.has_ability(project_id, 'issues.update'));

drop policy if exists issues_delete on flow.issues;
create policy issues_delete on flow.issues
  for delete using (flow.has_ability(project_id, 'issues.delete'));

-- Comments inherit their parent issue's project abilities.
drop policy if exists issue_comments_member_all on flow.issue_comments;

drop policy if exists issue_comments_select on flow.issue_comments;
create policy issue_comments_select on flow.issue_comments
  for select using (
    exists (
      select 1 from flow.issues i
      where i.id = issue_id and flow.has_ability(i.project_id, 'issues.view')
    )
  );

drop policy if exists issue_comments_insert on flow.issue_comments;
create policy issue_comments_insert on flow.issue_comments
  for insert with check (
    exists (
      select 1 from flow.issues i
      where i.id = issue_id and flow.has_ability(i.project_id, 'issues.comment')
    )
  );

drop policy if exists issue_comments_update on flow.issue_comments;
create policy issue_comments_update on flow.issue_comments
  for update using (
    exists (
      select 1 from flow.issues i
      where i.id = issue_id and flow.has_ability(i.project_id, 'issues.comment')
    )
  )
  with check (
    exists (
      select 1 from flow.issues i
      where i.id = issue_id and flow.has_ability(i.project_id, 'issues.comment')
    )
  );

drop policy if exists issue_comments_delete on flow.issue_comments;
create policy issue_comments_delete on flow.issue_comments
  for delete using (
    exists (
      select 1 from flow.issues i
      where i.id = issue_id and flow.has_ability(i.project_id, 'issues.comment')
    )
  );
