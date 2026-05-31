create table if not exists public.flow_workspace_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  role_key text not null,
  name text not null,
  description text,
  permissions jsonb not null default '[]'::jsonb,
  is_system boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, role_key)
);

create or replace function public.flow_can_manage_org_roles(organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.flow_profiles profile
    where profile.organization_id = $1
      and profile.id = auth.uid()
      and profile.role in ('workspace_owner', 'owner', 'admin', 'lead')
  );
$$;

create index if not exists flow_workspace_roles_org_idx
  on public.flow_workspace_roles (organization_id);

alter table public.flow_workspace_roles enable row level security;

drop policy if exists flow_profiles_role_manager_update on public.flow_profiles;
create policy flow_profiles_role_manager_update on public.flow_profiles
for update using (public.flow_can_manage_org_roles(organization_id))
with check (public.flow_can_manage_org_roles(organization_id));

drop policy if exists flow_workspace_roles_org_select on public.flow_workspace_roles;
create policy flow_workspace_roles_org_select on public.flow_workspace_roles
for select using (public.flow_is_org_member(organization_id));

drop policy if exists flow_workspace_roles_org_write on public.flow_workspace_roles;
create policy flow_workspace_roles_org_write on public.flow_workspace_roles
for all using (public.flow_can_manage_org_roles(organization_id))
with check (public.flow_can_manage_org_roles(organization_id));
