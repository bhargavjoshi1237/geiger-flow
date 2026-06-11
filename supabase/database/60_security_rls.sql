-- Shared behavior, bootstrap routines, row-level security, grants, and seeds.

create or replace function public.flow_is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select target_organization_id is not null
    and auth.uid() is not null
    and (
      exists (
        select 1
        from public.flow_organizations organization
        where organization.id = target_organization_id
          and organization.created_by = auth.uid()
          and organization.deleted_at is null
      )
      or exists (
        select 1
        from public.flow_organization_members member
        where member.organization_id = target_organization_id
          and member.user_id = auth.uid()
          and member.status = 'active'
      )
    );
$$;

create or replace function public.flow_has_org_permission(
  target_organization_id uuid,
  target_permission text
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.flow_is_org_member(target_organization_id)
    and (
      exists (
        select 1
        from public.flow_organizations organization
        where organization.id = target_organization_id
          and organization.created_by = auth.uid()
      )
      or exists (
        select 1
        from public.flow_organization_members member
        join public.flow_organization_member_roles member_role
          on member_role.organization_member_id = member.id
         and member_role.organization_id = member.organization_id
        join public.flow_workspace_roles role
          on role.id = member_role.role_id
         and role.organization_id = member.organization_id
        left join public.flow_role_permissions permission
          on permission.role_id = role.id
         and permission.organization_id = role.organization_id
        where member.organization_id = target_organization_id
          and member.user_id = auth.uid()
          and member.status = 'active'
          and (
            role.role_key in ('owner', 'admin')
            or role.permissions ? '*'
            or role.permissions ? target_permission
            or permission.permission_key in ('*', target_permission)
          )
      )
    );
$$;

create or replace function public.flow_can_manage_org(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.flow_has_org_permission(target_organization_id, 'organization.manage');
$$;

create or replace function public.flow_can_view_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select target_project_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.flow_projects project
      where project.id = target_project_id
        and project.deleted_at is null
        and (
          project.created_by = auth.uid()
          or public.flow_can_manage_org(project.organization_id)
          or exists (
            select 1
            from public.flow_project_members member
            where member.project_id = project.id
              and member.user_id = auth.uid()
              and member.status = 'active'
          )
          or (
            project.visibility in ('organization', 'public')
            and public.flow_is_org_member(project.organization_id)
          )
        )
    );
$$;

create or replace function public.flow_is_project_member(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.flow_can_view_project(target_project_id);
$$;

create or replace function public.flow_can_edit_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select target_project_id is not null
    and auth.uid() is not null
    and exists (
      select 1
      from public.flow_projects project
      where project.id = target_project_id
        and project.deleted_at is null
        and (
          project.created_by = auth.uid()
          or public.flow_can_manage_org(project.organization_id)
          or exists (
            select 1
            from public.flow_project_members member
            left join public.flow_project_member_roles member_role
              on member_role.project_member_id = member.id
             and member_role.project_id = member.project_id
            left join public.flow_project_roles role
              on role.id = member_role.role_id
             and role.project_id = member.project_id
            where member.project_id = project.id
              and member.user_id = auth.uid()
              and member.status = 'active'
              and (
                member.role in ('owner', 'admin', 'manager', 'editor', 'lead')
                or member.permissions @> '{"edit":true}'::jsonb
                or role.role_key in ('owner', 'admin', 'manager', 'editor')
                or role.permissions ? '*'
                or role.permissions ? 'project.edit'
              )
          )
        )
    );
$$;

create or replace function flow_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.flow_profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.flow_profiles.display_name, excluded.display_name),
        avatar_url = coalesce(public.flow_profiles.avatar_url, excluded.avatar_url),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists flow_auth_user_profile on auth.users;
create trigger flow_auth_user_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function flow_private.handle_new_user();

create or replace function public.flow_ensure_user_organization()
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  user_email text;
  user_metadata jsonb;
  display_name text;
  target_organization_id uuid;
  workspace_name text;
  workspace_slug text;
begin
  if current_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

  select profile.organization_id
  into target_organization_id
  from public.flow_profiles profile
  where profile.id = current_user_id;

  if target_organization_id is not null
    and exists (
      select 1
      from public.flow_organizations organization
      where organization.id = target_organization_id
        and organization.deleted_at is null
        and (
          organization.created_by = current_user_id
          or exists (
            select 1
            from public.flow_organization_members member
            where member.organization_id = organization.id
              and member.user_id = current_user_id
              and member.status = 'active'
          )
        )
    )
  then
    return target_organization_id;
  end if;

  select account.email, account.raw_user_meta_data
  into user_email, user_metadata
  from auth.users account
  where account.id = current_user_id;

  if not found then
    raise exception 'Authenticated user account was not found'
      using errcode = 'P0002';
  end if;

  display_name := coalesce(
    user_metadata ->> 'display_name',
    user_metadata ->> 'full_name',
    user_metadata ->> 'name',
    split_part(coalesce(user_email, ''), '@', 1),
    'User'
  );

  insert into public.flow_profiles (
    id,
    display_name,
    email,
    avatar_url
  )
  values (
    current_user_id,
    display_name,
    user_email,
    coalesce(user_metadata ->> 'avatar_url', user_metadata ->> 'picture')
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.flow_profiles.display_name, excluded.display_name),
      avatar_url = coalesce(public.flow_profiles.avatar_url, excluded.avatar_url),
      updated_at = now();

  select organization.id
  into target_organization_id
  from public.flow_organizations organization
  where organization.created_by = current_user_id
    and organization.deleted_at is null
  order by organization.created_at
  limit 1;

  if target_organization_id is null then
    workspace_name := display_name || '''s Workspace';
    workspace_slug :=
      coalesce(nullif(public.flow_slugify(workspace_name), ''), 'workspace')
      || '-'
      || left(replace(gen_random_uuid()::text, '-', ''), 8);

    insert into public.flow_organizations (
      name,
      slug,
      created_by
    )
    values (
      workspace_name,
      workspace_slug,
      current_user_id
    )
    returning id into target_organization_id;
  end if;

  update public.flow_profiles
  set organization_id = target_organization_id,
      role = 'owner',
      updated_at = now()
  where id = current_user_id;

  return target_organization_id;
end;
$$;

insert into public.flow_profiles (id, display_name, email, avatar_url)
select
  user_account.id,
  coalesce(
    user_account.raw_user_meta_data ->> 'display_name',
    user_account.raw_user_meta_data ->> 'full_name',
    split_part(coalesce(user_account.email, ''), '@', 1)
  ),
  user_account.email,
  coalesce(
    user_account.raw_user_meta_data ->> 'avatar_url',
    user_account.raw_user_meta_data ->> 'picture'
  )
from auth.users user_account
on conflict (id) do update
set email = excluded.email,
    display_name = coalesce(public.flow_profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.flow_profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

create or replace function flow_private.bootstrap_organization()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  owner_role_id uuid;
  member_id uuid;
begin
  insert into public.flow_workspace_roles (
    organization_id, role_key, name, description, permissions, is_system, created_by
  )
  values
    (new.id, 'owner', 'Owner', 'Full organization access.', '["*"]'::jsonb, true, new.created_by),
    (new.id, 'admin', 'Administrator', 'Manage members, settings, and projects.', '["organization.manage","project.create","project.edit"]'::jsonb, true, new.created_by),
    (new.id, 'member', 'Member', 'Standard organization access.', '["project.view","project.create"]'::jsonb, true, new.created_by),
    (new.id, 'viewer', 'Viewer', 'Read-only organization access.', '["project.view"]'::jsonb, true, new.created_by)
  on conflict (organization_id, role_key) do nothing;

  if new.created_by is not null then
    insert into public.flow_organization_members (
      organization_id, user_id, status, joined_at, created_by
    )
    values (new.id, new.created_by, 'active', now(), new.created_by)
    on conflict (organization_id, user_id) do update
      set status = 'active',
          joined_at = coalesce(public.flow_organization_members.joined_at, now()),
          updated_at = now()
    returning id into member_id;

    select id into owner_role_id
    from public.flow_workspace_roles
    where organization_id = new.id and role_key = 'owner';

    insert into public.flow_organization_member_roles (
      organization_member_id, organization_id, role_id, assigned_by
    )
    values (member_id, new.id, owner_role_id, new.created_by)
    on conflict do nothing;

    update public.flow_profiles
    set organization_id = coalesce(organization_id, new.id),
        role = case when organization_id is null or organization_id = new.id then 'owner' else role end,
        updated_at = now()
    where id = new.created_by;
  end if;

  return new;
end;
$$;

drop trigger if exists flow_organization_bootstrap on public.flow_organizations;
create trigger flow_organization_bootstrap
after insert on public.flow_organizations
for each row execute function flow_private.bootstrap_organization();

create or replace function flow_private.bootstrap_project()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  owner_role_id uuid;
  member_id uuid;
begin
  insert into public.flow_project_settings (project_id) values (new.id)
  on conflict (project_id) do nothing;

  insert into public.flow_security_settings (project_id) values (new.id)
  on conflict (project_id) do nothing;

  insert into public.flow_project_roles (project_id, role_key, name, description, permissions, is_system)
  values
    (new.id, 'owner', 'Owner', 'Full project access.', '["*"]'::jsonb, true),
    (new.id, 'manager', 'Manager', 'Manage project work and membership.', '["project.edit","project.members.manage"]'::jsonb, true),
    (new.id, 'editor', 'Editor', 'Create and update project work.', '["project.edit"]'::jsonb, true),
    (new.id, 'viewer', 'Viewer', 'Read-only project access.', '["project.view"]'::jsonb, true)
  on conflict (project_id, role_key) do nothing;

  if new.created_by is not null then
    insert into public.flow_project_members (
      project_id, user_id, display_name, role, joined_at, status, created_by
    )
    select
      new.id,
      new.created_by,
      profile.display_name,
      'owner',
      now(),
      'active',
      new.created_by
    from public.flow_profiles profile
    where profile.id = new.created_by
    on conflict (project_id, user_id) where user_id is not null do update
      set role = 'owner', status = 'active', joined_at = coalesce(public.flow_project_members.joined_at, now())
    returning id into member_id;

    if member_id is not null then
      select id into owner_role_id
      from public.flow_project_roles
      where project_id = new.id and role_key = 'owner';

      insert into public.flow_project_member_roles (
        project_member_id, project_id, role_id, assigned_by
      )
      values (member_id, new.id, owner_role_id, new.created_by)
      on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists flow_project_bootstrap on public.flow_projects;
create trigger flow_project_bootstrap
after insert on public.flow_projects
for each row execute function flow_private.bootstrap_project();

create or replace function flow_private.prevent_task_dependency_cycle()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    with recursive dependency_path(task_id) as (
      select new.depends_on_task_id
      union
      select dependency.depends_on_task_id
      from public.flow_task_dependencies dependency
      join dependency_path path on dependency.task_id = path.task_id
      where dependency.project_id = new.project_id
        and (tg_op = 'INSERT' or dependency.id <> new.id)
    )
    select 1 from dependency_path where task_id = new.task_id
  ) then
    raise exception 'Task dependency would create a cycle';
  end if;
  return new;
end;
$$;

create trigger flow_task_dependency_cycle
before insert or update of task_id, depends_on_task_id, project_id
on public.flow_task_dependencies
for each row execute function flow_private.prevent_task_dependency_cycle();

create or replace function flow_private.prevent_task_parent_cycle()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.parent_task_id is null then
    return new;
  end if;

  if new.parent_task_id = new.id or exists (
    with recursive parent_path(id, parent_task_id) as (
      select task.id, task.parent_task_id
      from public.flow_tasks task
      where task.id = new.parent_task_id and task.project_id = new.project_id
      union
      select task.id, task.parent_task_id
      from public.flow_tasks task
      join parent_path path on task.id = path.parent_task_id
      where task.project_id = new.project_id
    )
    select 1 from parent_path where id = new.id
  ) then
    raise exception 'Task parent would create a cycle';
  end if;
  return new;
end;
$$;

create trigger flow_task_parent_cycle
before insert or update of parent_task_id, project_id
on public.flow_tasks
for each row execute function flow_private.prevent_task_parent_cycle();

do $$
declare
  target record;
begin
  for target in
    select table_schema, table_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name like 'flow\_%' escape '\'
      and column_name = 'updated_at'
  loop
    execute format('drop trigger if exists flow_touch_updated_at on %I.%I', target.table_schema, target.table_name);
    execute format(
      'create trigger flow_touch_updated_at before update on %I.%I for each row execute function public.flow_set_updated_at()',
      target.table_schema,
      target.table_name
    );
  end loop;
end;
$$;

create trigger flow_notification_timestamp_sync
before insert or update of read, read_at, delivered_at
on public.flow_notifications
for each row execute function public.flow_sync_notification_timestamps();

do $$
declare
  target record;
begin
  for target in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public' and tablename like 'flow\_%' escape '\'
  loop
    execute format('alter table %I.%I enable row level security', target.schemaname, target.tablename);
  end loop;
end;
$$;

-- Ordinary tenant-scoped records use project access when a project is present,
-- otherwise they use organization membership.
do $$
declare
  target record;
  read_expression text;
  write_expression text;
  special_tables constant text[] := array[
    'flow_organizations',
    'flow_profiles',
    'flow_notifications',
    'flow_notification_preferences',
    'flow_addons',
    'flow_billing_plans',
    'flow_workspace_roles',
    'flow_role_permissions',
    'flow_organization_members',
    'flow_organization_member_roles',
    'flow_invitations',
    'flow_sso_providers',
    'flow_scim_connections',
    'flow_api_keys',
    'flow_security_policies',
    'flow_ip_allowlist',
    'flow_data_retention_policies',
    'flow_encryption_keys',
    'flow_integrations',
    'flow_billing_accounts',
    'flow_subscriptions',
    'flow_invoices',
    'flow_org_privacy_settings',
    'flow_vault_items',
    'flow_vault_access_grants',
    'flow_vault_access_events',
    'flow_security_settings',
    'flow_security_findings',
    'flow_access_events',
    'flow_audit_events',
    'flow_jobs',
    'flow_outbox_events',
    'flow_saved_views',
    'flow_sql_queries'
  ];
begin
  for target in
    select
      table_name,
      bool_or(column_name = 'organization_id') as has_organization,
      bool_or(column_name = 'project_id') as has_project
    from information_schema.columns
    where table_schema = 'public' and table_name like 'flow\_%' escape '\'
    group by table_name
  loop
    continue when target.table_name = any(special_tables);
    continue when not target.has_organization and not target.has_project;

    if target.has_organization and target.has_project then
      read_expression :=
        '((project_id is not null and public.flow_can_view_project(project_id)) ' ||
        'or (project_id is null and public.flow_is_org_member(organization_id)))';
      write_expression :=
        '((project_id is not null and public.flow_can_edit_project(project_id)) ' ||
        'or (project_id is null and public.flow_is_org_member(organization_id)))';
    elsif target.has_project then
      read_expression := 'public.flow_can_view_project(project_id)';
      write_expression := 'public.flow_can_edit_project(project_id)';
    else
      read_expression := 'public.flow_is_org_member(organization_id)';
      write_expression := 'public.flow_is_org_member(organization_id)';
    end if;

    execute format(
      'create policy %I on public.%I for select to authenticated using (%s)',
      target.table_name || '_read',
      target.table_name,
      read_expression
    );
    execute format(
      'create policy %I on public.%I for all to authenticated using (%s) with check (%s)',
      target.table_name || '_write',
      target.table_name,
      write_expression,
      write_expression
    );
  end loop;
end;
$$;

create policy flow_organizations_create on public.flow_organizations
for insert to authenticated
with check (created_by = auth.uid());

create policy flow_organizations_read on public.flow_organizations
for select to authenticated
using (created_by = auth.uid() or public.flow_is_org_member(id));

create policy flow_organizations_manage on public.flow_organizations
for update to authenticated
using (public.flow_can_manage_org(id))
with check (public.flow_can_manage_org(id));

create policy flow_profiles_read on public.flow_profiles
for select to authenticated
using (
  id = auth.uid()
  or (
    organization_id is not null
    and public.flow_is_org_member(organization_id)
  )
);

create policy flow_profiles_create on public.flow_profiles
for insert to authenticated
with check (id = auth.uid());

create policy flow_profiles_update on public.flow_profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists flow_projects_read on public.flow_projects;
drop policy if exists flow_projects_write on public.flow_projects;
create policy flow_projects_read on public.flow_projects
for select to authenticated
using (
  created_by = auth.uid()
  or public.flow_can_view_project(id)
);

drop policy if exists flow_projects_create on public.flow_projects;
create policy flow_projects_create on public.flow_projects
for insert to authenticated
with check (
  created_by = auth.uid()
  and public.flow_has_org_permission(organization_id, 'project.create')
);

drop policy if exists flow_projects_update on public.flow_projects;
create policy flow_projects_update on public.flow_projects
for update to authenticated
using (public.flow_can_edit_project(id))
with check (
  created_by = auth.uid()
  or public.flow_can_edit_project(id)
);

drop policy if exists flow_projects_delete on public.flow_projects;
create policy flow_projects_delete on public.flow_projects
for delete to authenticated
using (public.flow_can_edit_project(id));

drop policy if exists flow_teams_read on public.flow_teams;
drop policy if exists flow_teams_write on public.flow_teams;
create policy flow_teams_read on public.flow_teams
for select to authenticated
using (
  (project_id is not null and public.flow_can_view_project(project_id))
  or (project_id is null and public.flow_is_org_member(organization_id))
);

create policy flow_teams_write on public.flow_teams
for all to authenticated
using (
  (project_id is not null and public.flow_can_edit_project(project_id))
  or (project_id is null and public.flow_can_manage_org(organization_id))
)
with check (
  (project_id is not null and public.flow_can_edit_project(project_id))
  or (project_id is null and public.flow_can_manage_org(organization_id))
);

create policy flow_notifications_owner on public.flow_notifications
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy flow_notification_preferences_owner on public.flow_notification_preferences
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy flow_addons_catalog_read on public.flow_addons
for select to authenticated
using (status in ('active', 'deprecated'));

create policy flow_billing_plans_catalog_read on public.flow_billing_plans
for select to authenticated
using (status = 'active');

-- Administrative and secret-bearing tables require tenant management access.
do $$
declare
  target record;
  access_expression text;
begin
  for target in
    select
      table_name,
      bool_or(column_name = 'organization_id') as has_organization,
      bool_or(column_name = 'project_id') as has_project
    from information_schema.columns
    where table_schema = 'public'
      and table_name = any(array[
        'flow_workspace_roles',
        'flow_role_permissions',
        'flow_organization_members',
        'flow_organization_member_roles',
        'flow_invitations',
        'flow_sso_providers',
        'flow_scim_connections',
        'flow_api_keys',
        'flow_security_policies',
        'flow_ip_allowlist',
        'flow_data_retention_policies',
        'flow_encryption_keys',
        'flow_integrations',
        'flow_billing_accounts',
        'flow_subscriptions',
        'flow_invoices',
        'flow_org_privacy_settings',
        'flow_security_settings',
        'flow_security_findings'
      ])
    group by table_name
  loop
    if target.has_organization and target.has_project then
      access_expression :=
        '((project_id is not null and public.flow_can_edit_project(project_id)) ' ||
        'or (project_id is null and public.flow_can_manage_org(organization_id)))';
    elsif target.has_project then
      access_expression := 'public.flow_can_edit_project(project_id)';
    else
      access_expression := 'public.flow_can_manage_org(organization_id)';
    end if;

    execute format(
      'create policy %I on public.%I for all to authenticated using (%s) with check (%s)',
      target.table_name || '_manage',
      target.table_name,
      access_expression,
      access_expression
    );
  end loop;
end;
$$;

create policy flow_payment_methods_manage on public.flow_payment_methods
for all to authenticated
using (
  exists (
    select 1
    from public.flow_billing_accounts account
    where account.id = billing_account_id
      and public.flow_can_manage_org(account.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.flow_billing_accounts account
    where account.id = billing_account_id
      and public.flow_can_manage_org(account.organization_id)
  )
);

create policy flow_saved_views_read on public.flow_saved_views
for select to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'project' and project_id is not null and public.flow_can_view_project(project_id))
  or (visibility in ('organization', 'public') and public.flow_is_org_member(organization_id))
);

create policy flow_saved_views_write on public.flow_saved_views
for all to authenticated
using (
  owner_id = auth.uid()
  or (project_id is not null and public.flow_can_edit_project(project_id))
  or public.flow_can_manage_org(organization_id)
)
with check (
  owner_id = auth.uid()
  or (project_id is not null and public.flow_can_edit_project(project_id))
  or public.flow_can_manage_org(organization_id)
);

create policy flow_sql_queries_read on public.flow_sql_queries
for select to authenticated
using (
  created_by = auth.uid()
  or (visibility = 'project' and public.flow_can_view_project(project_id))
  or (
    visibility = 'organization'
    and exists (
      select 1
      from public.flow_projects project
      where project.id = project_id
        and public.flow_is_org_member(project.organization_id)
    )
  )
);

create policy flow_sql_queries_write on public.flow_sql_queries
for all to authenticated
using (created_by = auth.uid() or public.flow_can_edit_project(project_id))
with check (created_by = auth.uid() or public.flow_can_edit_project(project_id));

create policy flow_vault_items_read on public.flow_vault_items
for select to authenticated
using (
  created_by = auth.uid()
  or public.flow_can_edit_project(project_id)
  or exists (
    select 1
    from public.flow_vault_access_grants grant_record
    where grant_record.vault_item_id = id
      and grant_record.starts_at <= now()
      and (grant_record.expires_at is null or grant_record.expires_at > now())
      and (
        grant_record.grantee_user_id = auth.uid()
        or grant_record.grantee_email = (auth.jwt() ->> 'email')::citext
      )
  )
);

create policy flow_vault_items_write on public.flow_vault_items
for all to authenticated
using (created_by = auth.uid() or public.flow_can_edit_project(project_id))
with check (created_by = auth.uid() or public.flow_can_edit_project(project_id));

create policy flow_vault_grants_manage on public.flow_vault_access_grants
for all to authenticated
using (public.flow_can_edit_project(project_id))
with check (public.flow_can_edit_project(project_id));

create policy flow_vault_events_read on public.flow_vault_access_events
for select to authenticated
using (
  actor_id = auth.uid()
  or public.flow_can_edit_project(project_id)
  or exists (
    select 1
    from public.flow_vault_access_grants grant_record
    where grant_record.vault_item_id = vault_item_id
      and grant_record.grantee_user_id = auth.uid()
  )
);

create policy flow_vault_events_create on public.flow_vault_access_events
for insert to authenticated
with check (actor_id = auth.uid() and public.flow_can_view_project(project_id));

create policy flow_access_events_read on public.flow_access_events
for select to authenticated
using (
  (project_id is not null and public.flow_can_edit_project(project_id))
  or (project_id is null and public.flow_can_manage_org(organization_id))
);

create policy flow_audit_events_read on public.flow_audit_events
for select to authenticated
using (
  (project_id is not null and public.flow_can_edit_project(project_id))
  or (project_id is null and public.flow_can_manage_org(organization_id))
);

-- Child tables inherit access from their scoped parent without duplicating tenant keys.
do $$
declare
  mapping record;
begin
  for mapping in
    select * from (values
      (
        'flow_project_template_versions',
        'exists (select 1 from public.flow_project_templates parent where parent.id = template_id and (parent.visibility = ''public'' or (parent.organization_id is not null and public.flow_is_org_member(parent.organization_id))))',
        'exists (select 1 from public.flow_project_templates parent where parent.id = template_id and parent.organization_id is not null and public.flow_can_manage_org(parent.organization_id))'
      ),
      (
        'flow_timesheet_entries',
        'exists (select 1 from public.flow_timesheets parent where parent.id = timesheet_id and (parent.user_id = auth.uid() or public.flow_can_manage_org(parent.organization_id)))',
        'exists (select 1 from public.flow_timesheets parent where parent.id = timesheet_id and (parent.user_id = auth.uid() or public.flow_can_manage_org(parent.organization_id)))'
      ),
      (
        'flow_approval_decisions',
        'exists (select 1 from public.flow_approval_steps step join public.flow_approvals parent on parent.id = step.approval_id where step.id = approval_step_id and (approver_id = auth.uid() or (parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'approver_id = auth.uid()'
      ),
      (
        'flow_custom_field_options',
        'exists (select 1 from public.flow_custom_fields parent where parent.id = field_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or (parent.project_id is null and public.flow_is_org_member(parent.organization_id))))',
        'exists (select 1 from public.flow_custom_fields parent where parent.id = field_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or (parent.project_id is null and public.flow_is_org_member(parent.organization_id))))'
      ),
      (
        'flow_demand_scores',
        'exists (select 1 from public.flow_demand_requests parent where parent.id = request_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_demand_requests parent where parent.id = request_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))'
      ),
      (
        'flow_integration_sync_events',
        'exists (select 1 from public.flow_integration_sync_runs parent where parent.id = sync_run_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))',
        'exists (select 1 from public.flow_integration_sync_runs parent where parent.id = sync_run_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))'
      ),
      (
        'flow_webhook_deliveries',
        'exists (select 1 from public.flow_webhook_endpoints parent where parent.id = endpoint_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))',
        'false'
      ),
      (
        'flow_dataset_versions',
        'exists (select 1 from public.flow_datasets parent where parent.id = dataset_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_datasets parent where parent.id = dataset_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))'
      ),
      (
        'flow_dataset_fields',
        'exists (select 1 from public.flow_dataset_versions version join public.flow_datasets parent on parent.id = version.dataset_id where version.id = dataset_version_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_dataset_versions version join public.flow_datasets parent on parent.id = version.dataset_id where version.id = dataset_version_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))'
      ),
      (
        'flow_dataset_refresh_runs',
        'exists (select 1 from public.flow_datasets parent where parent.id = dataset_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_datasets parent where parent.id = dataset_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))'
      ),
      (
        'flow_dashboard_widgets',
        'exists (select 1 from public.flow_dashboards parent where parent.id = dashboard_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_dashboards parent where parent.id = dashboard_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))'
      ),
      (
        'flow_automation_rule_versions',
        'exists (select 1 from public.flow_automation_rules parent where parent.id = rule_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_automation_rules parent where parent.id = rule_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))'
      ),
      (
        'flow_automation_run_steps',
        'exists (select 1 from public.flow_automation_runs parent where parent.id = run_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'false'
      ),
      (
        'flow_scenario_changes',
        'exists (select 1 from public.flow_scenarios parent where parent.id = scenario_id and public.flow_can_view_project(parent.project_id))',
        'exists (select 1 from public.flow_scenarios parent where parent.id = scenario_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_change_request_impacts',
        'exists (select 1 from public.flow_change_requests parent where parent.id = change_request_id and public.flow_can_view_project(parent.project_id))',
        'exists (select 1 from public.flow_change_requests parent where parent.id = change_request_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_risk_actions',
        'exists (select 1 from public.flow_risks parent where parent.id = risk_id and public.flow_can_view_project(parent.project_id))',
        'exists (select 1 from public.flow_risks parent where parent.id = risk_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_decision_options',
        'exists (select 1 from public.flow_decisions parent where parent.id = decision_id and public.flow_can_view_project(parent.project_id))',
        'exists (select 1 from public.flow_decisions parent where parent.id = decision_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_readiness_items',
        'exists (select 1 from public.flow_readiness_checklists parent where parent.id = checklist_id and public.flow_can_view_project(parent.project_id))',
        'exists (select 1 from public.flow_readiness_checklists parent where parent.id = checklist_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_readiness_signoffs',
        'exists (select 1 from public.flow_readiness_checklists parent where parent.id = checklist_id and public.flow_can_view_project(parent.project_id))',
        'signer_id = auth.uid() or exists (select 1 from public.flow_readiness_checklists parent where parent.id = checklist_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_feedback_theme_links',
        'exists (select 1 from public.flow_feedback parent where parent.id = feedback_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_feedback parent where parent.id = feedback_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))'
      ),
      (
        'flow_experiment_variants',
        'exists (select 1 from public.flow_experiments parent where parent.id = experiment_id and public.flow_can_view_project(parent.project_id))',
        'exists (select 1 from public.flow_experiments parent where parent.id = experiment_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_experiment_metrics',
        'exists (select 1 from public.flow_experiments parent where parent.id = experiment_id and public.flow_can_view_project(parent.project_id))',
        'exists (select 1 from public.flow_experiments parent where parent.id = experiment_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_experiment_results',
        'exists (select 1 from public.flow_experiments parent where parent.id = experiment_id and public.flow_can_view_project(parent.project_id))',
        'exists (select 1 from public.flow_experiments parent where parent.id = experiment_id and public.flow_can_edit_project(parent.project_id))'
      ),
      (
        'flow_incident_responders',
        'exists (select 1 from public.flow_incidents parent where parent.id = incident_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_incidents parent where parent.id = incident_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))'
      ),
      (
        'flow_incident_timeline',
        'exists (select 1 from public.flow_incidents parent where parent.id = incident_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_incidents parent where parent.id = incident_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))'
      ),
      (
        'flow_incident_postmortems',
        'exists (select 1 from public.flow_incidents parent where parent.id = incident_id and ((parent.project_id is not null and public.flow_can_view_project(parent.project_id)) or public.flow_is_org_member(parent.organization_id)))',
        'exists (select 1 from public.flow_incidents parent where parent.id = incident_id and ((parent.project_id is not null and public.flow_can_edit_project(parent.project_id)) or public.flow_can_manage_org(parent.organization_id)))'
      )
    ) as policy_map(table_name, read_expression, write_expression)
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (%s)',
      mapping.table_name || '_inherited_read',
      mapping.table_name,
      mapping.read_expression
    );
    execute format(
      'create policy %I on public.%I for all to authenticated using (%s) with check (%s)',
      mapping.table_name || '_inherited_write',
      mapping.table_name,
      mapping.write_expression,
      mapping.write_expression
    );
  end loop;
end;
$$;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

revoke all on function public.flow_is_org_member(uuid) from public;
revoke all on function public.flow_has_org_permission(uuid, text) from public;
revoke all on function public.flow_can_manage_org(uuid) from public;
revoke all on function public.flow_can_view_project(uuid) from public;
revoke all on function public.flow_is_project_member(uuid) from public;
revoke all on function public.flow_can_edit_project(uuid) from public;
revoke all on function public.flow_ensure_user_organization() from public;
grant execute on function public.flow_is_org_member(uuid) to authenticated;
grant execute on function public.flow_has_org_permission(uuid, text) to authenticated;
grant execute on function public.flow_can_manage_org(uuid) to authenticated;
grant execute on function public.flow_can_view_project(uuid) to authenticated;
grant execute on function public.flow_is_project_member(uuid) to authenticated;
grant execute on function public.flow_can_edit_project(uuid) to authenticated;
grant execute on function public.flow_ensure_user_organization() to authenticated;

insert into public.flow_addons (
  addon_key, name, description, category, color, features, manifest
)
values
  ('system-architecture', 'System Architecture', 'Map services, infrastructure, data stores, and operational flows.', 'Architecture', '#38bdf8', array['Architecture canvas', 'Node catalogue', 'Drag and drop'], '{"defaultEnabled":true}'::jsonb),
  ('forms', 'Forms', 'Create project forms and collect controlled submissions.', 'Collaboration', '#14b8a6', array['Form builder', 'Access controls', 'Responses'], '{}'::jsonb),
  ('credited-resources', 'Credited Resources', 'Allocate and monitor time-bound organization credits.', 'Resource Management', '#10b981', array['Credit pools', 'Allocations', 'Usage planning'], '{}'::jsonb),
  ('sql', 'SQL Explorer', 'Browse approved datasets and run governed SQL queries.', 'Database', '#3b82f6', array['Query editor', 'Table explorer', 'Query history'], '{}'::jsonb),
  ('risk-register', 'Risk Register', 'Track project risks, owners, and mitigations.', 'Planning', '#ef4444', array['Risk ownership', 'Mitigation tracking'], '{}'::jsonb),
  ('decision-log', 'Decision Log', 'Record important decisions with context and rationale.', 'Governance', '#f59e0b', array['Decision history', 'Options', 'Rationale'], '{}'::jsonb),
  ('release-readiness', 'Release Readiness', 'Coordinate release gates and sign-offs.', 'Delivery', '#10b981', array['Launch gates', 'Sign-offs', 'Blockers'], '{}'::jsonb),
  ('feedback-hub', 'Customer Feedback Hub', 'Centralize feedback and connect it to delivery work.', 'Product', '#06b6d4', array['Triage', 'Themes', 'Roadmap links'], '{}'::jsonb),
  ('experiments', 'Experiment Tracker', 'Plan and evaluate product experiments.', 'Growth', '#8b5cf6', array['Hypotheses', 'Variants', 'Results'], '{}'::jsonb),
  ('incident-center', 'Incident Center', 'Coordinate incident response, timelines, and postmortems.', 'Operations', '#ef4444', array['Incident response', 'Timeline', 'Postmortems'], '{}'::jsonb),
  ('budget-tracker', 'Budget Tracker', 'Track budgets, actuals, forecasts, and variance.', 'Finance', '#10b981', array['Budget rollups', 'Forecasts', 'Vendor costs'], '{}'::jsonb)
on conflict (addon_key) do update
set name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    color = excluded.color,
    features = excluded.features,
    manifest = excluded.manifest,
    updated_at = now();

insert into public.flow_billing_plans (
  plan_key, name, status, price_per_seat, billing_interval, included_units, features
)
values
  ('free', 'Free', 'active', 0, 'month', '{"members":5,"projects":3}'::jsonb, '["Core project management","Community support"]'::jsonb),
  ('team', 'Team', 'active', 12, 'month', '{"members":50,"projects":100}'::jsonb, '["All core modules","Automations","Standard integrations"]'::jsonb),
  ('business', 'Business', 'active', 28, 'month', '{"members":500,"projects":1000}'::jsonb, '["Portfolio management","Advanced reporting","SSO"]'::jsonb),
  ('enterprise', 'Enterprise', 'active', 0, 'year', '{}'::jsonb, '["SCIM","Regional hosting","Custom controls","Premium support"]'::jsonb)
on conflict (plan_key) do update
set name = excluded.name,
    status = excluded.status,
    price_per_seat = excluded.price_per_seat,
    billing_interval = excluded.billing_interval,
    included_units = excluded.included_units,
    features = excluded.features,
    updated_at = now();
