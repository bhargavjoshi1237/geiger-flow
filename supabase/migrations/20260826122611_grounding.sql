-- Grounding
--
-- Owns flow.grounding_channels and flow.grounding_messages: project-scoped
-- channels for admin-moderated context plus the messages posted into them
-- ('message' | 'broadcast'). Self-contained and idempotent.

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

create table if not exists flow.grounding_channels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  description text,
  -- locked channels are read-only for everyone except moderators
  is_locked boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.grounding_channels to anon, authenticated, service_role;

create index if not exists grounding_channels_project_idx
  on flow.grounding_channels (project_id, created_at);

drop trigger if exists grounding_channels_touch_updated_at on flow.grounding_channels;
create trigger grounding_channels_touch_updated_at
  before update on flow.grounding_channels
  for each row execute function flow.touch_updated_at();

create table if not exists flow.grounding_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references flow.grounding_channels(id) on delete cascade,
  body text not null,
  -- 'message' | 'broadcast' (keep in sync with MESSAGE_TYPES in
  -- features/grounding/constants.js)
  message_type text not null default 'message',
  is_pinned boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on flow.grounding_messages to anon, authenticated, service_role;

create index if not exists grounding_messages_channel_idx
  on flow.grounding_messages (channel_id, created_at);

drop trigger if exists grounding_messages_touch_updated_at on flow.grounding_messages;
create trigger grounding_messages_touch_updated_at
  before update on flow.grounding_messages
  for each row execute function flow.touch_updated_at();

-- Open the module to every project member (keep in sync with OPEN_MODULES in
-- lib/abilities.js).

insert into flow.open_module (module) values ('grounding')
  on conflict (module) do nothing;

-- Row level security — ability-scoped, one policy per action.

alter table flow.grounding_channels enable row level security;

drop policy if exists grounding_channels_select on flow.grounding_channels;
create policy grounding_channels_select on flow.grounding_channels
  for select using (flow.has_ability(project_id, 'grounding.view'));

drop policy if exists grounding_channels_insert on flow.grounding_channels;
create policy grounding_channels_insert on flow.grounding_channels
  for insert with check (flow.has_ability(project_id, 'grounding.create'));

drop policy if exists grounding_channels_update on flow.grounding_channels;
create policy grounding_channels_update on flow.grounding_channels
  for update
  using (flow.has_ability(project_id, 'grounding.update'))
  with check (flow.has_ability(project_id, 'grounding.update'));

drop policy if exists grounding_channels_delete on flow.grounding_channels;
create policy grounding_channels_delete on flow.grounding_channels
  for delete using (flow.has_ability(project_id, 'grounding.delete'));

-- Messages carry no project_id of their own; scope every ability check through
-- the parent channel's project.
alter table flow.grounding_messages enable row level security;

drop policy if exists grounding_messages_select on flow.grounding_messages;
create policy grounding_messages_select on flow.grounding_messages
  for select using (
    exists (
      select 1 from flow.grounding_channels c
      where c.id = grounding_messages.channel_id
        and flow.has_ability(c.project_id, 'grounding.view')
    )
  );

drop policy if exists grounding_messages_insert on flow.grounding_messages;
create policy grounding_messages_insert on flow.grounding_messages
  for insert with check (
    exists (
      select 1 from flow.grounding_channels c
      where c.id = grounding_messages.channel_id
        and flow.has_ability(c.project_id, 'grounding.create')
    )
  );

drop policy if exists grounding_messages_update on flow.grounding_messages;
create policy grounding_messages_update on flow.grounding_messages
  for update
  using (
    exists (
      select 1 from flow.grounding_channels c
      where c.id = grounding_messages.channel_id
        and flow.has_ability(c.project_id, 'grounding.update')
    )
  )
  with check (
    exists (
      select 1 from flow.grounding_channels c
      where c.id = grounding_messages.channel_id
        and flow.has_ability(c.project_id, 'grounding.update')
    )
  );

drop policy if exists grounding_messages_delete on flow.grounding_messages;
create policy grounding_messages_delete on flow.grounding_messages
  for delete using (
    exists (
      select 1 from flow.grounding_channels c
      where c.id = grounding_messages.channel_id
        and flow.has_ability(c.project_id, 'grounding.delete')
    )
  );

-- @down
drop table if exists flow.grounding_messages cascade;
drop table if exists flow.grounding_channels cascade;

delete from flow.open_module where module = 'grounding';
