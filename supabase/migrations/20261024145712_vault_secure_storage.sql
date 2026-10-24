-- Vault secure storage
--
-- Moves vault secrets out of flow.vault_items.metadata (plain text, readable by every project member) into Supabase
-- Vault, hashes each item's PIN or password with bcrypt, and serves secrets only through server-side reveal functions
-- that check who may open the item, count failed attempts (5 tries, then a 15-minute lock) and record every open.
-- Adds per-item access (everyone in the project, managers only, or named people) and member passkeys for WebAuthn.
-- Owns: flow.vault_item_secrets, flow.vault_access_attempts, flow.vault_access_events, flow.member_passkeys,
-- flow.webauthn_challenges, and the flow.vault_* functions below. Additive: the plain-text copies stay in metadata
-- until 20261024145713_vault_purge_plaintext runs after the matching Flow deploy.

-- @up
create extension if not exists pgcrypto with schema extensions;
create extension if not exists supabase_vault with schema vault;
create schema if not exists flow;
grant usage on schema flow to anon, authenticated, service_role;

-- How an item is opened, and who may open it. Editing these is limited to managers by the policies below.
alter table flow.vault_items
  add column if not exists access_method text not null default 'pin'
    check (access_method in ('pin', 'password', 'passkey'));
alter table flow.vault_items
  add column if not exists access_mode text not null default 'project'
    check (access_mode in ('project', 'managers', 'people'));
alter table flow.vault_items
  add column if not exists allowed_emails text[] not null default '{}';

-- Private: the Vault secret id and the bcrypt hash of the item's PIN or password. No client role can read it.
create table if not exists flow.vault_item_secrets (
  item_id uuid primary key references flow.vault_items(id) on delete cascade,
  secret_id uuid,
  code_hash text,
  code_method text check (code_method in ('pin', 'password')),
  updated_at timestamptz not null default now()
);

-- Private: failed PIN/password attempts per person and item.
create table if not exists flow.vault_access_attempts (
  item_id uuid not null references flow.vault_items(id) on delete cascade,
  user_id uuid not null,
  failed_count integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (item_id, user_id)
);

-- Append-only record of opens, failed attempts and lockouts, readable by the item's managers.
create table if not exists flow.vault_access_events (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references flow.vault_items(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid,
  user_email text,
  method text not null,
  outcome text not null check (outcome in ('opened', 'failed', 'locked')),
  created_at timestamptz not null default now()
);
create index if not exists vault_access_events_item_idx on flow.vault_access_events (item_id, created_at desc);

-- A member's registered passkeys (WebAuthn credentials). Written only by the server; removing one hard-deletes it.
create table if not exists flow.member_passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  device_type text,
  backed_up boolean not null default false,
  name text not null default 'Passkey',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists member_passkeys_user_idx on flow.member_passkeys (user_id);

-- Private: one-time WebAuthn challenges, consumed by the server routes.
create table if not exists flow.webauthn_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  purpose text not null check (purpose in ('register', 'reveal')),
  item_id uuid,
  challenge text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists webauthn_challenges_user_idx on flow.webauthn_challenges (user_id, purpose);

revoke all on flow.vault_item_secrets, flow.vault_access_attempts, flow.webauthn_challenges from anon, authenticated;
grant all on flow.vault_item_secrets, flow.vault_access_attempts, flow.webauthn_challenges to service_role;
revoke all on flow.vault_access_events, flow.member_passkeys from anon, authenticated;
grant select on flow.vault_access_events to authenticated;
grant select, delete on flow.member_passkeys to authenticated;
grant all on flow.vault_access_events, flow.member_passkeys to service_role;

alter table flow.vault_item_secrets enable row level security;
alter table flow.vault_access_attempts enable row level security;
alter table flow.webauthn_challenges enable row level security;
alter table flow.vault_access_events enable row level security;
alter table flow.member_passkeys enable row level security;

drop trigger if exists member_passkeys_touch_updated_at on flow.member_passkeys;
create trigger member_passkeys_touch_updated_at
  before update on flow.member_passkeys
  for each row execute function flow.touch_updated_at();

-- A person's role in a project, for any user (flow.project_role only answers for auth.uid()).
create or replace function flow.vault_role_for(p_project_id uuid, p_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_creator uuid;
  v_role text;
begin
  if p_user_id is null then
    return null;
  end if;

  select organization_id, created_by into v_org, v_creator from public.projects where id = p_project_id;

  if v_creator is not null and v_creator = p_user_id then
    return 'owner';
  end if;

  if v_org is null then
    -- Mirrors flow.has_ability: projects not yet linked to an organization are open.
    return 'member';
  end if;

  select lower(ou.role::text) into v_role
  from public.organization_users ou
  where ou."user" = p_user_id and ou.organization = v_org
  limit 1;

  if v_role is not null then
    return v_role;
  end if;

  if exists (select 1 from public.organizations o where o.id = v_org and o.created_by = p_user_id) then
    return 'owner';
  end if;

  return null;
end;
$$;

-- Managers of an item: the person who created it (while they're still in the project) and the project's owners.
create or replace function flow.vault_can_manage(p_item_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from flow.vault_items i
    where i.id = p_item_id
      and i.deleted_at is null
      and (
        (i.created_by = p_user_id and flow.vault_role_for(i.project_id, p_user_id) is not null)
        or flow.vault_role_for(i.project_id, p_user_id) = 'owner'
      )
  );
$$;

-- Whether a person may open an item: they must be in the project, and the item's access must include them.
create or replace function flow.vault_can_open(p_item_id uuid, p_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_item flow.vault_items;
  v_email text;
begin
  select * into v_item from flow.vault_items where id = p_item_id and deleted_at is null;
  if not found or flow.vault_role_for(v_item.project_id, p_user_id) is null then
    return false;
  end if;

  if flow.vault_can_manage(p_item_id, p_user_id) or v_item.access_mode = 'project' then
    return true;
  end if;

  if v_item.access_mode = 'people' then
    select lower(email) into v_email from auth.users where id = p_user_id;
    return v_email is not null
      and exists (select 1 from unnest(v_item.allowed_emails) e where lower(trim(e)) = v_email);
  end if;

  return false;
end;
$$;

-- Records an open, failed attempt or lockout in the item's access history and the project's activity log.
create or replace function flow.vault_record_access(p_item_id uuid, p_user_id uuid, p_method text, p_outcome text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item flow.vault_items;
  v_email text;
begin
  select * into v_item from flow.vault_items where id = p_item_id;
  select email into v_email from auth.users where id = p_user_id;

  insert into flow.vault_access_events (item_id, project_id, user_id, user_email, method, outcome)
  values (v_item.id, v_item.project_id, p_user_id, v_email, p_method, p_outcome);

  insert into flow.activity_logs (project_id, level, source, actor, message, detail, created_by)
  values (
    v_item.project_id,
    case p_outcome when 'opened' then 'info' when 'failed' then 'warning' else 'error' end,
    'vault',
    p_user_id::text,
    case p_outcome
      when 'opened' then format('Opened vault item "%s"', v_item.name)
      when 'failed' then format('Failed attempt to open vault item "%s"', v_item.name)
      else format('Locked vault item "%s" for 15 minutes after 5 failed attempts', v_item.name)
    end,
    jsonb_build_object('id', v_item.id, 'method', p_method, 'outcome', p_outcome),
    p_user_id
  );
end;
$$;

-- What the signed-in person can do with each item in a project, without exposing any secret.
create or replace function flow.vault_item_permissions(p_project_id uuid)
returns table (item_id uuid, can_open boolean, can_manage boolean, has_secret boolean, has_code boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select
    i.id,
    flow.vault_can_open(i.id, auth.uid()),
    flow.vault_can_manage(i.id, auth.uid()),
    s.secret_id is not null,
    s.code_hash is not null and s.code_method = i.access_method
  from flow.vault_items i
  left join flow.vault_item_secrets s on s.item_id = i.id
  where i.project_id = p_project_id
    and i.deleted_at is null
    and flow.has_ability(p_project_id, 'vault.view');
$$;

-- Sets an item's secret, its unlock method and/or its PIN or password in one step, so a failure changes nothing.
-- Null or empty arguments keep what's stored. Managers only. Also drops any plain-text copy left in metadata.
create or replace function flow.vault_save_secret(
  p_item_id uuid,
  p_secret text default null,
  p_code text default null,
  p_method text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_item flow.vault_items;
  v_row flow.vault_item_secrets;
  v_method text;
  v_secret_id uuid;
  v_hash text;
  v_code_method text;
begin
  if v_user is null then
    raise exception 'Sign in to change this secret.' using errcode = '28000';
  end if;

  select * into v_item from flow.vault_items where id = p_item_id and deleted_at is null;
  if not found or not flow.vault_can_manage(p_item_id, v_user) then
    raise exception 'Only the person who added this secret or an organization owner can change it.' using errcode = '42501';
  end if;

  v_method := coalesce(nullif(p_method, ''), v_item.access_method);
  if v_method not in ('pin', 'password', 'passkey') then
    raise exception 'Unknown unlock method.' using errcode = '22023';
  end if;

  select * into v_row from flow.vault_item_secrets where item_id = p_item_id;
  v_secret_id := v_row.secret_id;

  if coalesce(p_secret, '') <> '' then
    if v_secret_id is null then
      v_secret_id := vault.create_secret(p_secret, 'flow.vault_item.' || p_item_id, 'Geiger Flow vault item');
    else
      perform vault.update_secret(v_secret_id, p_secret);
    end if;
  end if;

  if v_method = 'passkey' then
    v_hash := null;
    v_code_method := null;
  elsif coalesce(p_code, '') <> '' then
    if v_method = 'pin' and p_code !~ '^[0-9]{4,8}$' then
      raise exception 'A PIN must be 4 to 8 digits.' using errcode = '22023';
    end if;
    if v_method = 'password' and length(p_code) < 8 then
      raise exception 'A password must be at least 8 characters.' using errcode = '22023';
    end if;
    v_hash := extensions.crypt(p_code, extensions.gen_salt('bf', 10));
    v_code_method := v_method;
    delete from flow.vault_access_attempts where item_id = p_item_id;
  elsif v_row.code_hash is not null and v_row.code_method = v_method then
    v_hash := v_row.code_hash;
    v_code_method := v_row.code_method;
  else
    raise exception 'Set a % for this secret.', case v_method when 'pin' then 'PIN' else 'password' end
      using errcode = '22023';
  end if;

  insert into flow.vault_item_secrets (item_id, secret_id, code_hash, code_method, updated_at)
  values (p_item_id, v_secret_id, v_hash, v_code_method, now())
  on conflict (item_id) do update
    set secret_id = excluded.secret_id,
        code_hash = excluded.code_hash,
        code_method = excluded.code_method,
        updated_at = now();

  update flow.vault_items
  set access_method = v_method,
      metadata = metadata - 'secret' - 'accessSetup'
  where id = p_item_id;
end;
$$;

-- Opens an item with its PIN or password. Returns { ok, secret } or { ok: false, error, attemptsLeft | lockedUntil }.
-- Never raises after counting an attempt, so a wrong code is always recorded.
create or replace function flow.vault_reveal(p_item_id uuid, p_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_item flow.vault_items;
  v_row flow.vault_item_secrets;
  v_attempt flow.vault_access_attempts;
  v_failed integer;
  v_secret text;
  v_until timestamptz;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  -- One attempt at a time per person and item, so parallel guesses can't all read the same attempt count.
  perform pg_advisory_xact_lock(hashtextextended('flow.vault_reveal:' || p_item_id::text || ':' || v_user::text, 0));

  select * into v_item from flow.vault_items where id = p_item_id and deleted_at is null;
  if not found or not flow.vault_can_open(p_item_id, v_user) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  if v_item.access_method = 'passkey' then
    return jsonb_build_object('ok', false, 'error', 'passkey_required');
  end if;

  select * into v_row from flow.vault_item_secrets where item_id = p_item_id;
  if v_row.secret_id is null then
    return jsonb_build_object('ok', false, 'error', 'no_secret');
  end if;
  if v_row.code_hash is null or v_row.code_method is distinct from v_item.access_method then
    return jsonb_build_object('ok', false, 'error', 'no_code');
  end if;

  select * into v_attempt from flow.vault_access_attempts where item_id = p_item_id and user_id = v_user;
  if v_attempt.locked_until is not null and v_attempt.locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'locked', 'lockedUntil', v_attempt.locked_until);
  end if;

  if coalesce(p_code, '') = '' or extensions.crypt(p_code, v_row.code_hash) <> v_row.code_hash then
    v_failed := case when v_attempt.locked_until is not null then 0 else coalesce(v_attempt.failed_count, 0) end + 1;

    if v_failed >= 5 then
      v_until := now() + interval '15 minutes';
      insert into flow.vault_access_attempts (item_id, user_id, failed_count, locked_until, updated_at)
      values (p_item_id, v_user, 0, v_until, now())
      on conflict (item_id, user_id) do update set failed_count = 0, locked_until = v_until, updated_at = now();
      perform flow.vault_record_access(p_item_id, v_user, v_item.access_method, 'locked');
      return jsonb_build_object('ok', false, 'error', 'locked', 'lockedUntil', v_until);
    end if;

    insert into flow.vault_access_attempts (item_id, user_id, failed_count, locked_until, updated_at)
    values (p_item_id, v_user, v_failed, null, now())
    on conflict (item_id, user_id) do update set failed_count = v_failed, locked_until = null, updated_at = now();
    perform flow.vault_record_access(p_item_id, v_user, v_item.access_method, 'failed');
    return jsonb_build_object('ok', false, 'error', 'wrong_code', 'attemptsLeft', 5 - v_failed);
  end if;

  delete from flow.vault_access_attempts where item_id = p_item_id and user_id = v_user;
  select decrypted_secret into v_secret from vault.decrypted_secrets where id = v_row.secret_id;
  if v_secret is null then
    return jsonb_build_object('ok', false, 'error', 'no_secret');
  end if;
  perform flow.vault_record_access(p_item_id, v_user, v_item.access_method, 'opened');
  return jsonb_build_object('ok', true, 'secret', v_secret);
end;
$$;

-- Opens a passkey item for a person whose passkey the server has just verified. Server (service role) only.
create or replace function flow.vault_reveal_verified(p_item_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_item flow.vault_items;
  v_row flow.vault_item_secrets;
  v_secret text;
begin
  select * into v_item from flow.vault_items where id = p_item_id and deleted_at is null;
  if not found or not flow.vault_can_open(p_item_id, p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  if v_item.access_method <> 'passkey' then
    return jsonb_build_object('ok', false, 'error', 'code_required');
  end if;

  select * into v_row from flow.vault_item_secrets where item_id = p_item_id;
  if v_row.secret_id is null then
    return jsonb_build_object('ok', false, 'error', 'no_secret');
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets where id = v_row.secret_id;
  if v_secret is null then
    return jsonb_build_object('ok', false, 'error', 'no_secret');
  end if;
  perform flow.vault_record_access(p_item_id, p_user_id, 'passkey', 'opened');
  return jsonb_build_object('ok', true, 'secret', v_secret);
end;
$$;

-- Copies a secret and its PIN or password onto a freshly created duplicate. Only the source's managers may do this:
-- they already control its value and code, whereas anyone else could reset the copy's code and read the secret.
create or replace function flow.vault_duplicate_secret(p_source_id uuid, p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_source flow.vault_items;
  v_target flow.vault_items;
  v_row flow.vault_item_secrets;
  v_secret text;
  v_secret_id uuid;
begin
  select * into v_source from flow.vault_items where id = p_source_id and deleted_at is null;
  select * into v_target from flow.vault_items where id = p_target_id and deleted_at is null;

  if v_user is null or v_source.id is null or v_target.id is null
    or v_source.project_id <> v_target.project_id
    or not flow.vault_can_manage(p_source_id, v_user)
    or not flow.vault_can_manage(p_target_id, v_user) then
    raise exception 'Only the person who added this secret or an organization owner can duplicate it.' using errcode = '42501';
  end if;

  if exists (select 1 from flow.vault_item_secrets where item_id = p_target_id and secret_id is not null) then
    raise exception 'The copy already has a secret.' using errcode = '22023';
  end if;

  select * into v_row from flow.vault_item_secrets where item_id = p_source_id;
  if v_row.secret_id is not null then
    select decrypted_secret into v_secret from vault.decrypted_secrets where id = v_row.secret_id;
    v_secret_id := vault.create_secret(v_secret, 'flow.vault_item.' || p_target_id, 'Geiger Flow vault item');
  end if;

  insert into flow.vault_item_secrets (item_id, secret_id, code_hash, code_method, updated_at)
  values (
    p_target_id,
    v_secret_id,
    case when v_row.code_method = v_target.access_method then v_row.code_hash end,
    case when v_row.code_method = v_target.access_method then v_row.code_method end,
    now()
  )
  on conflict (item_id) do update
    set secret_id = excluded.secret_id,
        code_hash = excluded.code_hash,
        code_method = excluded.code_method,
        updated_at = now();
end;
$$;

-- Deleting an item (soft or hard) destroys its secret, hash and attempt counters.
create or replace function flow.vault_items_purge_secret()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' or (new.deleted_at is not null and old.deleted_at is null) then
    delete from vault.secrets
    where id in (select s.secret_id from flow.vault_item_secrets s where s.item_id = old.id and s.secret_id is not null);
    delete from flow.vault_item_secrets where item_id = old.id;
    delete from flow.vault_access_attempts where item_id = old.id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists vault_items_purge_secret on flow.vault_items;
create trigger vault_items_purge_secret
  before update of deleted_at or delete on flow.vault_items
  for each row execute function flow.vault_items_purge_secret();

revoke all on function flow.vault_role_for(uuid, uuid) from public, anon, authenticated;
revoke all on function flow.vault_can_manage(uuid, uuid) from public, anon, authenticated;
revoke all on function flow.vault_can_open(uuid, uuid) from public, anon, authenticated;
revoke all on function flow.vault_record_access(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function flow.vault_reveal_verified(uuid, uuid) from public, anon, authenticated;
revoke all on function flow.vault_items_purge_secret() from public, anon, authenticated;
revoke all on function flow.vault_item_permissions(uuid) from public, anon;
revoke all on function flow.vault_save_secret(uuid, text, text, text) from public, anon;
revoke all on function flow.vault_reveal(uuid, text) from public, anon;
revoke all on function flow.vault_duplicate_secret(uuid, uuid) from public, anon;
grant execute on function flow.vault_item_permissions(uuid) to authenticated, service_role;
grant execute on function flow.vault_save_secret(uuid, text, text, text) to authenticated, service_role;
grant execute on function flow.vault_reveal(uuid, text) to authenticated, service_role;
grant execute on function flow.vault_duplicate_secret(uuid, uuid) to authenticated, service_role;
grant execute on function flow.vault_can_open(uuid, uuid) to service_role;
grant execute on function flow.vault_reveal_verified(uuid, uuid) to service_role;

-- Only an item's managers may change or delete it (soft delete is an update); new items must name their creator.
drop policy if exists vault_items_insert on flow.vault_items;
create policy vault_items_insert on flow.vault_items
  for insert with check (flow.has_ability(project_id, 'vault.create') and created_by = auth.uid());

drop policy if exists vault_items_update on flow.vault_items;
create policy vault_items_update on flow.vault_items
  for update
  using (flow.has_ability(project_id, 'vault.update') and (created_by = auth.uid() or flow.project_role(project_id) = 'owner'))
  with check (flow.has_ability(project_id, 'vault.update') and (created_by = auth.uid() or flow.project_role(project_id) = 'owner'));

drop policy if exists vault_items_delete on flow.vault_items;
create policy vault_items_delete on flow.vault_items
  for delete using (flow.has_ability(project_id, 'vault.delete') and (created_by = auth.uid() or flow.project_role(project_id) = 'owner'));

drop policy if exists vault_access_events_select on flow.vault_access_events;
create policy vault_access_events_select on flow.vault_access_events
  for select using (
    flow.project_role(project_id) = 'owner'
    or exists (select 1 from flow.vault_items i where i.id = item_id and i.created_by = auth.uid())
  );

drop policy if exists member_passkeys_select_own on flow.member_passkeys;
create policy member_passkeys_select_own on flow.member_passkeys
  for select using (user_id = auth.uid());

drop policy if exists member_passkeys_delete_own on flow.member_passkeys;
create policy member_passkeys_delete_own on flow.member_passkeys
  for delete using (user_id = auth.uid());

-- Backfill: each item's method comes from its saved setup (the old passkey "unlock" verified nothing, so those items
-- fall back to PIN and need one set), its secret moves into Vault, and its PIN or password is hashed.
update flow.vault_items
set access_method = case when metadata->'accessSetup'->>'method' = 'password' then 'password' else 'pin' end
where not exists (select 1 from flow.vault_item_secrets s where s.item_id = vault_items.id);

insert into flow.vault_item_secrets (item_id, secret_id, code_hash, code_method)
select
  i.id,
  case when coalesce(i.metadata->>'secret', '') <> ''
    then vault.create_secret(i.metadata->>'secret', 'flow.vault_item.' || i.id, 'Geiger Flow vault item')
  end,
  case
    when i.access_method = 'pin' and coalesce(i.metadata->'accessSetup'->>'pin', '') ~ '^[0-9]{4,8}$'
      then extensions.crypt(i.metadata->'accessSetup'->>'pin', extensions.gen_salt('bf', 10))
    when i.access_method = 'password' and coalesce(i.metadata->'accessSetup'->>'password', '') <> ''
      then extensions.crypt(i.metadata->'accessSetup'->>'password', extensions.gen_salt('bf', 10))
  end,
  case
    when i.access_method = 'pin' and coalesce(i.metadata->'accessSetup'->>'pin', '') ~ '^[0-9]{4,8}$' then 'pin'
    when i.access_method = 'password' and coalesce(i.metadata->'accessSetup'->>'password', '') <> '' then 'password'
  end
from flow.vault_items i
where i.deleted_at is null
  and not exists (select 1 from flow.vault_item_secrets s where s.item_id = i.id);

-- @down
-- Puts each live secret back into metadata first, so the previous client can still read it. PINs and passwords are
-- stored only as hashes and can't be restored; those items need a new code set from the previous client.
update flow.vault_items i
set metadata = i.metadata || jsonb_build_object('secret', d.decrypted_secret, 'accessSetup', jsonb_build_object('method', i.access_method))
from flow.vault_item_secrets s
join vault.decrypted_secrets d on d.id = s.secret_id
where s.item_id = i.id and i.deleted_at is null and coalesce(i.metadata->>'secret', '') = '';

drop trigger if exists vault_items_purge_secret on flow.vault_items;

delete from vault.secrets where name like 'flow.vault_item.%';

drop function if exists flow.vault_items_purge_secret();
drop function if exists flow.vault_duplicate_secret(uuid, uuid);
drop function if exists flow.vault_reveal_verified(uuid, uuid);
drop function if exists flow.vault_reveal(uuid, text);
drop function if exists flow.vault_save_secret(uuid, text, text, text);
drop function if exists flow.vault_item_permissions(uuid);
drop function if exists flow.vault_record_access(uuid, uuid, text, text);
drop function if exists flow.vault_can_open(uuid, uuid);
drop function if exists flow.vault_can_manage(uuid, uuid);
drop function if exists flow.vault_role_for(uuid, uuid);

drop table if exists flow.webauthn_challenges cascade;
drop table if exists flow.member_passkeys cascade;
drop table if exists flow.vault_access_events cascade;
drop table if exists flow.vault_access_attempts cascade;
drop table if exists flow.vault_item_secrets cascade;

alter table flow.vault_items drop column if exists allowed_emails;
alter table flow.vault_items drop column if exists access_mode;
alter table flow.vault_items drop column if exists access_method;

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
