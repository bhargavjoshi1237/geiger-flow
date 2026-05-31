create table if not exists public.flow_vault_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  type text not null check (type in ('database', 'api_key', 'oauth', 'smtp', 'password', 'certificate', 'ssh_key', 'other')),
  username text,
  url text,
  notes text,
  secret_ref text,
  secret_preview text,
  access_control jsonb not null default '{}'::jsonb,
  ttl interval,
  expires_at timestamptz,
  keyless_entry boolean not null default false,
  access_setup jsonb not null default '{}'::jsonb,
  tags text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  rotated_at timestamptz,
  deleted_at timestamptz
);

create table if not exists public.flow_vault_access_grants (
  id uuid primary key default gen_random_uuid(),
  vault_item_id uuid not null references public.flow_vault_items(id) on delete cascade,
  grantee_user_id uuid references auth.users(id) on delete cascade,
  grantee_email citext,
  role text,
  position text,
  permission text not null default 'read' check (permission in ('read', 'write', 'admin')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.flow_vault_access_events (
  id uuid primary key default gen_random_uuid(),
  vault_item_id uuid not null references public.flow_vault_items(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event text not null,
  ip_address inet,
  user_agent text,
  success boolean not null default true,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists flow_vault_items_project_type_idx on public.flow_vault_items (project_id, type, deleted_at);
create index if not exists flow_vault_items_access_control_idx on public.flow_vault_items using gin (access_control);
create index if not exists flow_vault_access_events_project_idx on public.flow_vault_access_events (project_id, created_at desc);

alter table public.flow_vault_items enable row level security;
alter table public.flow_vault_access_grants enable row level security;
alter table public.flow_vault_access_events enable row level security;

drop policy if exists flow_vault_items_project_all on public.flow_vault_items;
create policy flow_vault_items_project_all on public.flow_vault_items
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_vault_access_grants_project_all on public.flow_vault_access_grants;
create policy flow_vault_access_grants_project_all on public.flow_vault_access_grants
for all using (exists (select 1 from public.flow_vault_items item where item.id = vault_item_id and public.flow_is_project_member(item.project_id)))
with check (exists (select 1 from public.flow_vault_items item where item.id = vault_item_id and public.flow_is_project_member(item.project_id)));

drop policy if exists flow_vault_access_events_project_select on public.flow_vault_access_events;
create policy flow_vault_access_events_project_select on public.flow_vault_access_events
for select using (public.flow_is_project_member(project_id));
