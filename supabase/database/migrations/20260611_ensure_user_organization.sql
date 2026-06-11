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

revoke all on function public.flow_ensure_user_organization() from public;
grant execute on function public.flow_ensure_user_organization() to authenticated;
