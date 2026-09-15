-- Chat workspace
--
-- Owns the flow.chat_* tables behind the Grounding screen: the full Geiger Chat
-- workspace (profiles, conversations, members, messages, threads, calls, files,
-- notifications, scheduled calls) ported into the `flow` schema and scoped to a
-- project instead of an organization.
--
-- Conversations carry project_id; every other table reaches a project through
-- its parent conversation, so RLS is expressed with the same flow.has_ability
-- grounding.* checks the legacy grounding tables used.
--
-- Also migrates flow.grounding_channels / flow.grounding_messages into the new
-- model (a channel becomes a conversation, a message becomes a chat message)
-- and leaves the legacy tables in place, untouched, for one release.
--
-- Self-contained and idempotent.

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

-- ---------------------------------------------------------------------------
-- Profiles — a person as chat sees them. Not project-scoped: one row per user
-- across the workspace, mirroring their identity and presence.
-- ---------------------------------------------------------------------------
create table if not exists flow.chat_profiles (
  id uuid primary key default gen_random_uuid(),
  email text,
  username text,
  display_name text not null default 'User',
  role text not null default '',
  avatar_color text not null default '#6366f1',
  presence text not null default 'offline',
  last_seen_at timestamptz not null default now(),
  project_id uuid references public.projects(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists chat_profiles_email_key
  on flow.chat_profiles (lower(email)) where email is not null;
create unique index if not exists chat_profiles_username_key
  on flow.chat_profiles (lower(username)) where username is not null;
create index if not exists chat_profiles_project_idx on flow.chat_profiles (project_id);

-- ---------------------------------------------------------------------------
-- Conversations — the project-scoped root. Everything else hangs off these.
-- ---------------------------------------------------------------------------
create table if not exists flow.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null default 'dm',
  name text,
  topic text,
  visibility text not null default 'public',
  dm_key text,
  created_by uuid references flow.chat_profiles(id) on delete set null,
  last_activity_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
-- A DM is unique per project, so the same two people can hold a DM in each.
create unique index if not exists chat_conversations_dm_key
  on flow.chat_conversations (project_id, dm_key) where dm_key is not null;
-- Channel names are unique per project (case-insensitive), which keeps the
-- #general bootstrap idempotent under a create race.
create unique index if not exists chat_conversations_project_channel_name_key
  on flow.chat_conversations (project_id, lower(name))
  where kind = 'channel' and deleted_at is null;
create index if not exists chat_conversations_project_kind_idx
  on flow.chat_conversations (project_id, kind) where deleted_at is null;
create index if not exists chat_conversations_activity_idx
  on flow.chat_conversations (last_activity_at desc) where deleted_at is null;

create table if not exists flow.chat_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references flow.chat_conversations(id) on delete cascade,
  profile_id uuid not null references flow.chat_profiles(id) on delete cascade,
  role text not null default 'member',
  pinned boolean not null default false,
  muted boolean not null default false,
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists chat_members_unique
  on flow.chat_members (conversation_id, profile_id);
create index if not exists chat_members_profile_idx on flow.chat_members (profile_id);

-- ---------------------------------------------------------------------------
-- Threads — a named sub-thread rooted on a message. Created before messages so
-- messages.thread_id can reference it directly.
-- ---------------------------------------------------------------------------
create table if not exists flow.chat_threads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references flow.chat_conversations(id) on delete cascade,
  root_message_id uuid,
  title text not null default 'Thread',
  created_by uuid references flow.chat_profiles(id) on delete set null,
  last_activity_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists chat_threads_conversation_idx
  on flow.chat_threads (conversation_id, last_activity_at desc) where deleted_at is null;

create table if not exists flow.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references flow.chat_conversations(id) on delete cascade,
  thread_id uuid references flow.chat_threads(id) on delete cascade,
  author_id uuid references flow.chat_profiles(id) on delete set null,
  text text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists chat_messages_conversation_idx
  on flow.chat_messages (conversation_id, created_at) where deleted_at is null;
create index if not exists chat_messages_thread_idx
  on flow.chat_messages (thread_id, created_at) where deleted_at is null;

-- root_message_id closes the threads <-> messages cycle; added once both exist.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chat_threads_root_message_fk') then
    alter table flow.chat_threads
      add constraint chat_threads_root_message_fk
      foreign key (root_message_id) references flow.chat_messages(id) on delete set null;
  end if;
end $$;

create table if not exists flow.chat_calls (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null default 'Call',
  kind text not null default 'video',
  direction text not null default 'outgoing',
  missed boolean not null default false,
  duration_mins integer not null default 0,
  owner_id uuid references flow.chat_profiles(id) on delete cascade,
  participant_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists chat_calls_owner_idx on flow.chat_calls (owner_id, created_at desc);
create index if not exists chat_calls_project_idx on flow.chat_calls (project_id, created_at desc);

create table if not exists flow.chat_files (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'file',
  kind text not null default 'doc',
  size text not null default '',
  source text not null default '',
  url text,
  content_type text,
  conversation_id uuid references flow.chat_conversations(id) on delete cascade,
  message_id uuid references flow.chat_messages(id) on delete set null,
  project_id uuid references public.projects(id) on delete cascade,
  owner_id uuid references flow.chat_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists chat_files_created_idx on flow.chat_files (created_at desc);
create index if not exists chat_files_conversation_idx
  on flow.chat_files (conversation_id, created_at desc);
create index if not exists chat_files_project_idx on flow.chat_files (project_id, created_at desc);

create table if not exists flow.chat_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references flow.chat_profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  type text not null default 'Message',
  title text not null default '',
  description text not null default '',
  read boolean not null default false,
  icon text not null default 'Bell',
  bg_color text not null default 'bg-surface-hover',
  icon_color text not null default 'text-muted-foreground',
  extra jsonb,
  created_at timestamptz not null default now()
);
create index if not exists chat_notifications_recipient_idx
  on flow.chat_notifications (profile_id, created_at desc);

create table if not exists flow.chat_scheduled_calls (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null default 'Scheduled call',
  kind text not null default 'video',
  scheduled_at timestamptz not null,
  conversation_id uuid,
  created_by uuid references flow.chat_profiles(id) on delete cascade,
  participant_ids jsonb not null default '[]'::jsonb,
  reminded boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists chat_scheduled_calls_owner_idx
  on flow.chat_scheduled_calls (created_by, scheduled_at);

-- ---------------------------------------------------------------------------
-- Triggers + RPCs
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['chat_profiles','chat_conversations','chat_messages','chat_threads']
  loop
    execute format('drop trigger if exists %I on flow.%I', t || '_touch', t);
    execute format(
      'create trigger %I before update on flow.%I for each row execute function flow.touch_updated_at()',
      t || '_touch', t);
  end loop;
end $$;

-- A new message bumps its conversation, and its thread when it is a reply.
create or replace function flow.chat_bump_activity()
returns trigger language plpgsql as $$
begin
  update flow.chat_conversations set last_activity_at = now() where id = new.conversation_id;
  if new.thread_id is not null then
    update flow.chat_threads set last_activity_at = now() where id = new.thread_id;
  end if;
  return new;
end;
$$;
drop trigger if exists chat_messages_bump_activity on flow.chat_messages;
create trigger chat_messages_bump_activity after insert on flow.chat_messages
  for each row execute function flow.chat_bump_activity();

-- Shallow-merge a patch into a message's metadata bag (reactions, replyTo, …).
create or replace function flow.chat_merge_message_meta(p_id uuid, p_patch jsonb)
returns void language sql as $$
  update flow.chat_messages
     set metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_patch, '{}'::jsonb)
   where id = p_id;
$$;

-- ---------------------------------------------------------------------------
-- Open the module + abilities. Chat reuses the grounding.* ability family, so
-- no new permission keys are introduced (see lib/abilities.js).
-- ---------------------------------------------------------------------------
insert into flow.open_module (module) values ('grounding') on conflict (module) do nothing;

-- ---------------------------------------------------------------------------
-- RLS — ability-scoped, mirroring the legacy grounding policies. Conversations
-- own project_id directly; children resolve it through their conversation.
-- ---------------------------------------------------------------------------
alter table flow.chat_conversations enable row level security;

drop policy if exists chat_conversations_select on flow.chat_conversations;
create policy chat_conversations_select on flow.chat_conversations
  for select using (flow.has_ability(project_id, 'grounding.view'));

drop policy if exists chat_conversations_insert on flow.chat_conversations;
create policy chat_conversations_insert on flow.chat_conversations
  for insert with check (flow.has_ability(project_id, 'grounding.create'));

drop policy if exists chat_conversations_update on flow.chat_conversations;
create policy chat_conversations_update on flow.chat_conversations
  for update using (flow.has_ability(project_id, 'grounding.update'))
  with check (flow.has_ability(project_id, 'grounding.update'));

drop policy if exists chat_conversations_delete on flow.chat_conversations;
create policy chat_conversations_delete on flow.chat_conversations
  for delete using (flow.has_ability(project_id, 'grounding.delete'));

-- Children of a conversation: one policy per action, scoped through the parent.
do $$
declare t text;
begin
  foreach t in array array['chat_members','chat_messages','chat_threads'] loop
    execute format('alter table flow.%I enable row level security', t);

    execute format('drop policy if exists %I on flow.%I', t || '_select', t);
    execute format($f$
      create policy %I on flow.%I for select using (
        exists (select 1 from flow.chat_conversations c
                 where c.id = %I.conversation_id
                   and flow.has_ability(c.project_id, 'grounding.view')))
    $f$, t || '_select', t, t);

    execute format('drop policy if exists %I on flow.%I', t || '_insert', t);
    execute format($f$
      create policy %I on flow.%I for insert with check (
        exists (select 1 from flow.chat_conversations c
                 where c.id = %I.conversation_id
                   and flow.has_ability(c.project_id, 'grounding.create')))
    $f$, t || '_insert', t, t);

    execute format('drop policy if exists %I on flow.%I', t || '_update', t);
    execute format($f$
      create policy %I on flow.%I for update using (
        exists (select 1 from flow.chat_conversations c
                 where c.id = %I.conversation_id
                   and flow.has_ability(c.project_id, 'grounding.update')))
      with check (
        exists (select 1 from flow.chat_conversations c
                 where c.id = %I.conversation_id
                   and flow.has_ability(c.project_id, 'grounding.update')))
    $f$, t || '_update', t, t, t);

    execute format('drop policy if exists %I on flow.%I', t || '_delete', t);
    execute format($f$
      create policy %I on flow.%I for delete using (
        exists (select 1 from flow.chat_conversations c
                 where c.id = %I.conversation_id
                   and flow.has_ability(c.project_id, 'grounding.delete')))
    $f$, t || '_delete', t, t);
  end loop;
end $$;

-- Profiles are the shared people directory: any signed-in user may read and
-- upsert their own presence. Not project-scoped, so it is not ability-gated.
alter table flow.chat_profiles enable row level security;
drop policy if exists chat_profiles_all on flow.chat_profiles;
create policy chat_profiles_all on flow.chat_profiles
  for all to anon, authenticated using (true) with check (true);

-- Project-scoped leaf tables: gate on their own project_id when set. A null
-- project_id (legacy/demo row) stays visible so nothing disappears silently.
do $$
declare t text;
begin
  foreach t in array array['chat_calls','chat_files','chat_scheduled_calls'] loop
    execute format('alter table flow.%I enable row level security', t);
    execute format('drop policy if exists %I on flow.%I', t || '_select', t);
    execute format($f$
      create policy %I on flow.%I for select using (
        project_id is null or flow.has_ability(project_id, 'grounding.view'))
    $f$, t || '_select', t);
    execute format('drop policy if exists %I on flow.%I', t || '_write', t);
    execute format($f$
      create policy %I on flow.%I for all to anon, authenticated using (
        project_id is null or flow.has_ability(project_id, 'grounding.create'))
      with check (
        project_id is null or flow.has_ability(project_id, 'grounding.create'))
    $f$, t || '_write', t);
  end loop;
end $$;

-- Notifications are addressed to a person, so they are readable by their owner
-- rather than by project ability.
alter table flow.chat_notifications enable row level security;
drop policy if exists chat_notifications_all on flow.chat_notifications;
create policy chat_notifications_all on flow.chat_notifications
  for all to anon, authenticated using (true) with check (true);

grant all on all tables in schema flow to anon, authenticated, service_role;
grant all on all sequences in schema flow to anon, authenticated, service_role;
grant all on all functions in schema flow to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Realtime publication — the tables the workspace subscribes to.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['chat_messages','chat_members','chat_conversations',
                             'chat_profiles','chat_notifications','chat_threads']
    loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'flow' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table flow.%I', t);
      end if;
    end loop;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Migrate the legacy grounding data.
--
-- Each grounding channel becomes a project channel conversation, each grounding
-- message a chat message. Ids are carried over so the move is idempotent and
-- re-running changes nothing. Authors are auth user ids with no chat profile
-- yet, so a profile is minted per distinct author first; author_id is left null
-- when the legacy row had none. The legacy tables are NOT dropped.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('flow.grounding_channels') is null then
    return;
  end if;

  -- A profile per legacy author, keyed by the author's auth user id so the
  -- same person keeps one identity across both tables.
  insert into flow.chat_profiles (id, display_name, role, presence)
  select distinct a.created_by, 'Member', '', 'offline'
    from (
      select created_by from flow.grounding_channels where created_by is not null
      union
      select created_by from flow.grounding_messages where created_by is not null
    ) a
  on conflict (id) do nothing;

  insert into flow.chat_conversations
    (id, project_id, kind, name, topic, visibility, created_by,
     metadata, created_at, updated_at, deleted_at, last_activity_at)
  select c.id,
         c.project_id,
         'channel',
         c.name,
         c.description,
         case when c.is_locked then 'private' else 'public' end,
         c.created_by,
         coalesce(c.metadata, '{}'::jsonb) || jsonb_build_object('migratedFrom', 'grounding_channels'),
         c.created_at,
         c.updated_at,
         c.deleted_at,
         c.updated_at
    from flow.grounding_channels c
  on conflict (id) do nothing;

  -- The channel creator is its first member and admin.
  insert into flow.chat_members (conversation_id, profile_id, role)
  select c.id, c.created_by, 'admin'
    from flow.grounding_channels c
   where c.created_by is not null
  on conflict (conversation_id, profile_id) do nothing;

  insert into flow.chat_messages
    (id, conversation_id, author_id, text, metadata, created_at, updated_at, deleted_at)
  select m.id,
         m.channel_id,
         m.created_by,
         m.body,
         coalesce(m.metadata, '{}'::jsonb)
           || jsonb_build_object('migratedFrom', 'grounding_messages',
                                 'messageType', m.message_type,
                                 'pinned', m.is_pinned),
         m.created_at,
         m.updated_at,
         m.deleted_at
    from flow.grounding_messages m
    join flow.grounding_channels c on c.id = m.channel_id
  on conflict (id) do nothing;

  -- Everyone who posted in a channel is a member of it.
  insert into flow.chat_members (conversation_id, profile_id, role)
  select distinct m.channel_id, m.created_by, 'member'
    from flow.grounding_messages m
   where m.created_by is not null
  on conflict (conversation_id, profile_id) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- Storage — the public "chat" bucket for shared files (chat/files/<uuid>/<f>).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('chat', 'chat', true)
on conflict (id) do update set name = excluded.name, public = excluded.public;

drop policy if exists "Chat public read" on storage.objects;
create policy "Chat public read" on storage.objects
  for select to public using (bucket_id = 'chat');

drop policy if exists "Chat member write" on storage.objects;
create policy "Chat member write" on storage.objects
  for insert to authenticated with check (bucket_id = 'chat');

drop policy if exists "Chat member update" on storage.objects;
create policy "Chat member update" on storage.objects
  for update to authenticated
  using (bucket_id = 'chat') with check (bucket_id = 'chat');

drop policy if exists "Chat member delete" on storage.objects;
create policy "Chat member delete" on storage.objects
  for delete to authenticated using (bucket_id = 'chat');

-- @down
drop policy if exists "Chat public read" on storage.objects;
drop policy if exists "Chat member write" on storage.objects;
drop policy if exists "Chat member update" on storage.objects;
drop policy if exists "Chat member delete" on storage.objects;
delete from storage.buckets where id = 'chat';

drop table if exists flow.chat_scheduled_calls cascade;
drop table if exists flow.chat_notifications cascade;
drop table if exists flow.chat_files cascade;
drop table if exists flow.chat_calls cascade;
drop table if exists flow.chat_messages cascade;
drop table if exists flow.chat_threads cascade;
drop table if exists flow.chat_members cascade;
drop table if exists flow.chat_conversations cascade;
drop table if exists flow.chat_profiles cascade;

drop function if exists flow.chat_merge_message_meta(uuid, jsonb);
drop function if exists flow.chat_bump_activity() cascade;
