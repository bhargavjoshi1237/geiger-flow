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
          or exists (
            select 1
            from public.flow_project_members member
            where member.project_id = project.id
              and member.user_id = auth.uid()
              and member.status = 'active'
              and member.role in ('owner', 'admin', 'manager', 'editor', 'lead')
          )
        )
    );
$$;

revoke all on function public.flow_is_org_member(uuid) from public;
revoke all on function public.flow_can_view_project(uuid) from public;
revoke all on function public.flow_can_edit_project(uuid) from public;
grant execute on function public.flow_is_org_member(uuid) to authenticated;
grant execute on function public.flow_can_view_project(uuid) to authenticated;
grant execute on function public.flow_can_edit_project(uuid) to authenticated;

drop policy if exists flow_projects_read on public.flow_projects;
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
  and public.flow_is_org_member(organization_id)
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
create policy flow_teams_read on public.flow_teams
for select to authenticated
using (
  (project_id is not null and public.flow_can_view_project(project_id))
  or (project_id is null and public.flow_is_org_member(organization_id))
);

drop policy if exists flow_teams_write on public.flow_teams;
create policy flow_teams_write on public.flow_teams
for all to authenticated
using (
  (project_id is not null and public.flow_can_edit_project(project_id))
  or (project_id is null and public.flow_is_org_member(organization_id))
)
with check (
  (project_id is not null and public.flow_can_edit_project(project_id))
  or (project_id is null and public.flow_is_org_member(organization_id))
);

notify pgrst, 'reload schema';
