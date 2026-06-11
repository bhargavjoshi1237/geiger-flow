create table public.flow_grounding_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  source_type text not null check (source_type in ('document', 'url', 'dataset', 'message', 'decision', 'integration', 'manual')),
  title text not null,
  description text,
  source_url text,
  storage_bucket text,
  storage_path text,
  content_hash text,
  extraction_status text not null default 'pending' check (extraction_status in ('pending', 'processing', 'ready', 'failed', 'archived')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id)
);

create table public.flow_grounding_channels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name citext not null,
  description text,
  channel_type text not null default 'discussion' check (channel_type in ('discussion', 'broadcast', 'decisions', 'blockers', 'admin')),
  visibility text not null default 'project' check (visibility in ('private', 'project', 'organization')),
  locked boolean not null default false,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name),
  unique (id, project_id)
);

create table public.flow_grounding_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  channel_id uuid not null references public.flow_grounding_channels(id) on delete cascade,
  parent_id uuid references public.flow_grounding_messages(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  message_type text not null default 'message' check (message_type in ('message', 'broadcast', 'decision', 'blocker', 'system')),
  body text not null,
  pinned boolean not null default false,
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (channel_id, project_id) references public.flow_grounding_channels(id, project_id) on delete cascade,
  unique (id, project_id)
);

create table public.flow_grounding_message_reactions (
  message_id uuid not null references public.flow_grounding_messages(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, reaction),
  foreign key (message_id, project_id) references public.flow_grounding_messages(id, project_id) on delete cascade
);

create table public.flow_grounding_acknowledgements (
  message_id uuid not null references public.flow_grounding_messages(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  primary key (message_id, user_id),
  foreign key (message_id, project_id) references public.flow_grounding_messages(id, project_id) on delete cascade
);

create table public.flow_planning_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  description text,
  file_type text not null default 'board' check (file_type in ('board', 'notes', 'mind_map', 'diagram', 'whiteboard')),
  icon text,
  light_accent text,
  dark_accent text,
  viewport jsonb not null default '{}'::jsonb check (jsonb_typeof(viewport) = 'object'),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  version integer not null default 1 check (version > 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (project_id, name),
  unique (id, project_id)
);

create table public.flow_planning_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  external_node_id text not null,
  node_type text not null,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  width double precision check (width is null or width > 0),
  height double precision check (height is null or height > 0),
  z_index integer not null default 0,
  parent_node_id uuid references public.flow_planning_nodes(id) on delete cascade,
  linked_entity_type text,
  linked_entity_id uuid,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  style jsonb not null default '{}'::jsonb check (jsonb_typeof(style) = 'object'),
  locked boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (planning_file_id, project_id) references public.flow_planning_files(id, project_id) on delete cascade,
  unique (planning_file_id, external_node_id),
  unique (id, project_id)
);

create table public.flow_planning_edges (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  external_edge_id text not null,
  source_node_id uuid not null references public.flow_planning_nodes(id) on delete cascade,
  target_node_id uuid not null references public.flow_planning_nodes(id) on delete cascade,
  source_handle text,
  target_handle text,
  edge_type text not null default 'default',
  label text,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  style jsonb not null default '{}'::jsonb check (jsonb_typeof(style) = 'object'),
  animated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_node_id <> target_node_id),
  foreign key (planning_file_id, project_id) references public.flow_planning_files(id, project_id) on delete cascade,
  foreign key (source_node_id, project_id) references public.flow_planning_nodes(id, project_id) on delete cascade,
  foreign key (target_node_id, project_id) references public.flow_planning_nodes(id, project_id) on delete cascade,
  unique (planning_file_id, external_edge_id)
);

create table public.flow_planning_collaborators (
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  permission text not null default 'edit' check (permission in ('view', 'comment', 'edit', 'admin')),
  last_seen_at timestamptz,
  cursor_state jsonb not null default '{}'::jsonb check (jsonb_typeof(cursor_state) = 'object'),
  joined_at timestamptz not null default now(),
  primary key (planning_file_id, user_id),
  foreign key (planning_file_id, project_id) references public.flow_planning_files(id, project_id) on delete cascade
);

create table public.flow_planning_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  node_id uuid references public.flow_planning_nodes(id) on delete cascade,
  parent_id uuid references public.flow_planning_comments(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  resolved boolean not null default false,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (planning_file_id, project_id) references public.flow_planning_files(id, project_id) on delete cascade
);

create table public.flow_planning_reactions (
  node_id uuid not null references public.flow_planning_nodes(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  primary key (node_id, user_id, reaction),
  foreign key (node_id, project_id) references public.flow_planning_nodes(id, project_id) on delete cascade
);

create table public.flow_collaboration_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  host_id uuid not null references auth.users(id) on delete cascade,
  join_code_hash text not null unique,
  status text not null default 'active' check (status in ('active', 'merging', 'closed', 'expired')),
  rollback jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  foreign key (planning_file_id, project_id) references public.flow_planning_files(id, project_id) on delete cascade,
  unique (id, project_id)
);

create table public.flow_collaboration_session_members (
  session_id uuid not null references public.flow_collaboration_sessions(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'joined' check (status in ('invited', 'joined', 'left', 'removed')),
  joined_at timestamptz,
  left_at timestamptz,
  primary key (session_id, user_id),
  foreign key (session_id, project_id) references public.flow_collaboration_sessions(id, project_id) on delete cascade
);

create table public.flow_planning_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  planning_file_id uuid not null references public.flow_planning_files(id) on delete cascade,
  version integer not null check (version > 0),
  nodes jsonb not null check (jsonb_typeof(nodes) = 'array'),
  edges jsonb not null check (jsonb_typeof(edges) = 'array'),
  viewport jsonb not null default '{}'::jsonb check (jsonb_typeof(viewport) = 'object'),
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (planning_file_id, project_id) references public.flow_planning_files(id, project_id) on delete cascade,
  unique (planning_file_id, version)
);

create table public.flow_architecture_diagrams (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'approved', 'archived')),
  viewport jsonb not null default '{}'::jsonb check (jsonb_typeof(viewport) = 'object'),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name),
  unique (id, project_id)
);

create table public.flow_architecture_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  diagram_id uuid not null references public.flow_architecture_diagrams(id) on delete cascade,
  external_node_id text not null,
  catalogue_key text,
  node_type text not null,
  name text not null,
  description text,
  provider text,
  category text,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  monthly_cost numeric(18,2) not null default 0 check (monthly_cost >= 0),
  currency char(3) not null default 'USD',
  enabled boolean not null default true,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (diagram_id, project_id) references public.flow_architecture_diagrams(id, project_id) on delete cascade,
  unique (diagram_id, external_node_id),
  unique (id, project_id)
);

create table public.flow_architecture_edges (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  diagram_id uuid not null references public.flow_architecture_diagrams(id) on delete cascade,
  external_edge_id text not null,
  source_node_id uuid not null references public.flow_architecture_nodes(id) on delete cascade,
  target_node_id uuid not null references public.flow_architecture_nodes(id) on delete cascade,
  edge_type text not null default 'data_flow',
  label text,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_node_id <> target_node_id),
  foreign key (diagram_id, project_id) references public.flow_architecture_diagrams(id, project_id) on delete cascade,
  foreign key (source_node_id, project_id) references public.flow_architecture_nodes(id, project_id) on delete cascade,
  foreign key (target_node_id, project_id) references public.flow_architecture_nodes(id, project_id) on delete cascade,
  unique (diagram_id, external_edge_id)
);

create table public.flow_asset_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  parent_id uuid references public.flow_asset_folders(id) on delete cascade,
  name text not null,
  description text,
  path ltree,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, parent_id, name),
  unique (id, project_id)
);

create table public.flow_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  folder_id uuid references public.flow_asset_folders(id) on delete set null,
  storage_bucket text not null default 'flow-assets',
  storage_path text not null,
  name text not null,
  type text not null check (type in ('Image', 'Video', 'Document', 'Audio', 'Archive', 'Other')),
  format text,
  mime_type text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  checksum text,
  status text not null default 'Active' check (status in ('Draft', 'Active', 'Archived', 'Deleted')),
  tags text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  usage_count bigint not null default 0 check (usage_count >= 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  unique (project_id, storage_bucket, storage_path),
  unique (id, project_id)
);

create table public.flow_asset_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  asset_id uuid not null references public.flow_assets(id) on delete cascade,
  version integer not null check (version > 0),
  storage_bucket text not null,
  storage_path text not null,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  checksum text,
  change_note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (asset_id, project_id) references public.flow_assets(id, project_id) on delete cascade,
  unique (asset_id, version)
);

create table public.flow_asset_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  asset_id uuid references public.flow_assets(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);

create table public.flow_asset_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  asset_id uuid not null references public.flow_assets(id) on delete cascade,
  share_type text not null check (share_type in ('user', 'email', 'public_link')),
  grantee_user_id uuid references auth.users(id) on delete cascade,
  grantee_email citext,
  permission text not null default 'view' check (permission in ('view', 'comment', 'download', 'edit')),
  token_hash text unique,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (asset_id, project_id) references public.flow_assets(id, project_id) on delete cascade
);

-- Forms domain tables retired: Geiger Forms owns geiger_forms, geiger_form_responses,
-- geiger_form_versions, and geiger_form_comments with project_id scoping.

create table public.flow_vault_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  type text not null check (type in ('database', 'api_key', 'oauth', 'smtp', 'password', 'certificate', 'ssh_key', 'other')),
  username text,
  url text,
  notes text,
  secret_ref text not null,
  secret_preview text,
  secret_fingerprint text,
  access_control jsonb not null default '{}'::jsonb check (jsonb_typeof(access_control) = 'object'),
  ttl interval,
  expires_at timestamptz,
  keyless_entry boolean not null default false,
  access_setup jsonb not null default '{}'::jsonb check (jsonb_typeof(access_setup) = 'object'),
  tags text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  rotated_at timestamptz,
  deleted_at timestamptz,
  unique (project_id, name),
  unique (id, project_id)
);

create table public.flow_vault_access_grants (
  id uuid primary key default gen_random_uuid(),
  vault_item_id uuid not null references public.flow_vault_items(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  grantee_user_id uuid references auth.users(id) on delete cascade,
  grantee_email citext,
  role text,
  position text,
  permission text not null default 'read' check (permission in ('read', 'write', 'admin')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(grantee_user_id, grantee_email, role, position) = 1),
  foreign key (vault_item_id, project_id) references public.flow_vault_items(id, project_id) on delete cascade
);

create table public.flow_vault_access_events (
  id uuid primary key default gen_random_uuid(),
  vault_item_id uuid not null references public.flow_vault_items(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event text not null,
  ip_address inet,
  user_agent text,
  success boolean not null default true,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (vault_item_id, project_id) references public.flow_vault_items(id, project_id) on delete cascade
);

create table public.flow_agent_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  task_id uuid references public.flow_tasks(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  provider text,
  agent_type text not null,
  external_session_id text,
  status text not null default 'active' check (status in ('active', 'completed', 'failed', 'cancelled')),
  prompt text,
  summary text,
  input_tokens bigint check (input_tokens is null or input_tokens >= 0),
  output_tokens bigint check (output_tokens is null or output_tokens >= 0),
  cost numeric(18,6) check (cost is null or cost >= 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.flow_agent_session_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  session_id uuid not null references public.flow_agent_sessions(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  occurred_at timestamptz not null default now()
);

create table public.flow_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  source text not null,
  level text not null default 'info' check (level in ('trace', 'debug', 'info', 'warn', 'error', 'fatal')),
  message text not null,
  correlation_id text,
  actor_id uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  occurred_at timestamptz not null default now()
);

create index flow_grounding_sources_project_idx on public.flow_grounding_sources (project_id, source_type, extraction_status);
create index flow_grounding_messages_channel_time_idx on public.flow_grounding_messages (channel_id, created_at);
create index flow_planning_files_project_idx on public.flow_planning_files (project_id, updated_at desc);
create index flow_planning_nodes_file_idx on public.flow_planning_nodes (planning_file_id, z_index);
create index flow_planning_nodes_linked_idx on public.flow_planning_nodes (linked_entity_type, linked_entity_id);
create index flow_planning_nodes_data_idx on public.flow_planning_nodes using gin (data);
create index flow_planning_edges_file_idx on public.flow_planning_edges (planning_file_id);
create index flow_planning_comments_file_idx on public.flow_planning_comments (planning_file_id, created_at);
create index flow_collaboration_sessions_file_idx on public.flow_collaboration_sessions (planning_file_id, status);
create index flow_planning_snapshots_file_idx on public.flow_planning_snapshots (planning_file_id, version desc);
create index flow_architecture_nodes_diagram_idx on public.flow_architecture_nodes (diagram_id, category);
create index flow_architecture_nodes_cost_idx on public.flow_architecture_nodes (project_id, enabled, monthly_cost);
create index flow_asset_folders_project_idx on public.flow_asset_folders (project_id, parent_id);
create index flow_assets_project_type_idx on public.flow_assets (project_id, type, status);
create index flow_assets_tags_idx on public.flow_assets using gin (tags);
create index flow_assets_metadata_idx on public.flow_assets using gin (metadata);
create index flow_asset_activity_project_idx on public.flow_asset_activity (project_id, created_at desc);
create index flow_vault_items_project_type_idx on public.flow_vault_items (project_id, type, deleted_at);
create index flow_vault_items_tags_idx on public.flow_vault_items using gin (tags);
create index flow_vault_access_events_project_idx on public.flow_vault_access_events (project_id, created_at desc);
create index flow_agent_sessions_project_idx on public.flow_agent_sessions (project_id, started_at desc);
create unique index flow_agent_sessions_external_unique_idx
  on public.flow_agent_sessions (project_id, provider, external_session_id)
  where external_session_id is not null;
create index flow_agent_session_events_session_idx on public.flow_agent_session_events (session_id, occurred_at);
create index flow_logs_project_time_idx on public.flow_logs (project_id, occurred_at desc);
create index flow_logs_correlation_idx on public.flow_logs (project_id, correlation_id);
create index flow_logs_payload_idx on public.flow_logs using gin (payload);
