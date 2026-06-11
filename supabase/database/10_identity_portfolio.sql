create table public.flow_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  slug citext not null unique check (slug::text = public.flow_slugify(slug::text)),
  suite_account_id uuid,
  plan_key text not null default 'free',
  status text not null default 'active' check (status in ('active', 'paused', 'suspended', 'deleted')),
  timezone text not null default 'UTC',
  locale text not null default 'en',
  data_region text not null default 'ap-south-1',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.flow_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.flow_organizations(id) on delete set null,
  display_name text,
  email citext,
  avatar_url text,
  role text not null default 'member',
  position text,
  timezone text not null default 'UTC',
  locale text not null default 'en',
  preferences jsonb not null default '{}'::jsonb check (jsonb_typeof(preferences) = 'object'),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_workspace_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  role_key text not null check (role_key ~ '^[a-z][a-z0-9_]{1,62}$'),
  name text not null check (length(trim(name)) between 1 and 100),
  description text,
  permissions jsonb not null default '[]'::jsonb check (jsonb_typeof(permissions) = 'array'),
  is_system boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, role_key),
  unique (id, organization_id)
);

create table public.flow_role_permissions (
  role_id uuid not null references public.flow_workspace_roles(id) on delete cascade,
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  permission_key text not null check (permission_key ~ '^[a-z][a-z0-9_.:-]{2,127}$'),
  conditions jsonb not null default '{}'::jsonb check (jsonb_typeof(conditions) = 'object'),
  created_at timestamptz not null default now(),
  primary key (role_id, permission_key),
  foreign key (role_id, organization_id) references public.flow_workspace_roles(id, organization_id) on delete cascade
);

create table public.flow_organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('invited', 'active', 'suspended', 'removed')),
  title text,
  department text,
  manager_user_id uuid references auth.users(id) on delete set null,
  joined_at timestamptz,
  invited_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (id, organization_id)
);

create table public.flow_organization_member_roles (
  organization_member_id uuid not null references public.flow_organization_members(id) on delete cascade,
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  role_id uuid not null references public.flow_workspace_roles(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (organization_member_id, role_id),
  foreign key (organization_member_id, organization_id) references public.flow_organization_members(id, organization_id) on delete cascade,
  foreign key (role_id, organization_id) references public.flow_workspace_roles(id, organization_id) on delete cascade
);

create table public.flow_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid,
  email citext not null,
  role_key text not null default 'member',
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid,
  name text not null default 'Core Team',
  description text,
  members jsonb not null default '[]'::jsonb check (jsonb_typeof(members) in ('array', 'object')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table public.flow_portfolios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  parent_id uuid references public.flow_portfolios(id) on delete set null,
  name text not null,
  slug citext not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('draft', 'active', 'on_hold', 'archived')),
  priority smallint not null default 0,
  budget_currency char(3) not null default 'USD',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organization_id, slug),
  unique (id, organization_id)
);

create table public.flow_programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  portfolio_id uuid references public.flow_portfolios(id) on delete set null,
  name text not null,
  slug citext not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'planning' check (status in ('planning', 'active', 'on_hold', 'completed', 'archived')),
  starts_on date,
  ends_on date,
  budget numeric(18,2) check (budget is null or budget >= 0),
  currency char(3) not null default 'USD',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  unique (organization_id, slug),
  unique (id, organization_id)
);

create table public.flow_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  portfolio_id uuid references public.flow_portfolios(id) on delete set null,
  program_id uuid references public.flow_programs(id) on delete set null,
  parent_project_id uuid references public.flow_projects(id) on delete set null,
  name text not null check (length(trim(name)) between 1 and 200),
  slug citext not null,
  code citext,
  description text,
  logo_url text,
  provider text not null default 'AWS',
  region text not null default 'ap-south-1',
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'PAUSED', 'ARCHIVED', 'UNKNOWN', 'DELETED')),
  lifecycle_stage text not null default 'planning' check (lifecycle_stage in ('intake', 'planning', 'execution', 'monitoring', 'closing', 'closed')),
  health text not null default 'unknown' check (health in ('unknown', 'on_track', 'at_risk', 'off_track')),
  visibility text not null default 'organization' check (visibility in ('private', 'project', 'organization', 'public')),
  tags text[] not null default array[]::text[],
  color text,
  priority smallint not null default 0,
  budget numeric(18,2) check (budget is null or budget >= 0),
  currency char(3) not null default 'USD',
  starts_on date,
  ends_on date,
  baseline_starts_on date,
  baseline_ends_on date,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  search_vector tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(name, '') || ' ' ||
      coalesce(code::text, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(provider, '') || ' ' ||
      coalesce(region, '')
    )
  ) stored,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  check (baseline_ends_on is null or baseline_starts_on is null or baseline_ends_on >= baseline_starts_on),
  unique (organization_id, slug),
  unique (organization_id, code),
  unique (id, organization_id)
);

alter table public.flow_invitations
  add constraint flow_invitations_project_fk
  foreign key (project_id) references public.flow_projects(id) on delete cascade;

alter table public.flow_teams
  add constraint flow_teams_project_fk
  foreign key (project_id) references public.flow_projects(id) on delete cascade;

create table public.flow_project_roles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  role_key text not null check (role_key ~ '^[a-z][a-z0-9_]{1,62}$'),
  name text not null,
  description text,
  permissions jsonb not null default '[]'::jsonb check (jsonb_typeof(permissions) = 'array'),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, role_key),
  unique (id, project_id)
);

create table public.flow_project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email citext,
  display_name text,
  role text not null default 'member',
  position text,
  permissions jsonb not null default '{}'::jsonb check (jsonb_typeof(permissions) = 'object'),
  allocation_percent numeric(5,2) not null default 100 check (allocation_percent between 0 and 100),
  billable_rate numeric(14,2) check (billable_rate is null or billable_rate >= 0),
  cost_rate numeric(14,2) check (cost_rate is null or cost_rate >= 0),
  joined_at timestamptz,
  invited_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('invited', 'active', 'inactive', 'removed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or email is not null),
  unique (id, project_id)
);

create table public.flow_project_member_roles (
  project_member_id uuid not null references public.flow_project_members(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  role_id uuid not null references public.flow_project_roles(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (project_member_id, role_id),
  foreign key (project_member_id, project_id) references public.flow_project_members(id, project_id) on delete cascade,
  foreign key (role_id, project_id) references public.flow_project_roles(id, project_id) on delete cascade
);

create table public.flow_team_members (
  team_id uuid not null references public.flow_teams(id) on delete cascade,
  project_member_id uuid not null references public.flow_project_members(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  role text,
  joined_at timestamptz not null default now(),
  primary key (team_id, project_member_id),
  foreign key (project_member_id, project_id) references public.flow_project_members(id, project_id) on delete cascade
);

create table public.flow_project_settings (
  project_id uuid primary key references public.flow_projects(id) on delete cascade,
  general jsonb not null default '{}'::jsonb check (jsonb_typeof(general) = 'object'),
  connections jsonb not null default '{}'::jsonb check (jsonb_typeof(connections) = 'object'),
  customs jsonb not null default '{}'::jsonb check (jsonb_typeof(customs) = 'object'),
  usage_limits jsonb not null default '{}'::jsonb check (jsonb_typeof(usage_limits) = 'object'),
  advanced jsonb not null default '{}'::jsonb check (jsonb_typeof(advanced) = 'object'),
  enterprise jsonb not null default '{}'::jsonb check (jsonb_typeof(enterprise) = 'object'),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.flow_project_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  template_key text not null,
  name text not null,
  description text,
  category text,
  visibility text not null default 'organization' check (visibility in ('private', 'organization', 'public')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, template_key),
  unique (id, organization_id)
);

create table public.flow_project_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.flow_project_templates(id) on delete cascade,
  version integer not null check (version > 0),
  definition jsonb not null check (jsonb_typeof(definition) = 'object'),
  changelog text,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);

create table public.flow_project_template_instances (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  template_version_id uuid not null references public.flow_project_template_versions(id) on delete restrict,
  applied_by uuid references auth.users(id) on delete set null,
  applied_at timestamptz not null default now(),
  status text not null default 'applied' check (status in ('pending', 'applied', 'failed', 'rolled_back')),
  result jsonb not null default '{}'::jsonb check (jsonb_typeof(result) = 'object')
);

create table public.flow_project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  parent_id uuid references public.flow_project_phases(id) on delete cascade,
  name text not null,
  wbs_code text,
  description text,
  status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'cancelled')),
  starts_on date,
  ends_on date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  unique (project_id, wbs_code),
  unique (id, project_id)
);

create table public.flow_workstreams (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  phase_id uuid references public.flow_project_phases(id) on delete set null,
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('planned', 'active', 'completed', 'archived')),
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name),
  unique (id, project_id)
);

create table public.flow_releases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  workstream_id uuid references public.flow_workstreams(id) on delete set null,
  name text not null,
  version text,
  description text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'in_review', 'ready', 'released', 'cancelled')),
  owner_id uuid references auth.users(id) on delete set null,
  target_at timestamptz,
  released_at timestamptz,
  readiness_score numeric(5,2) check (readiness_score is null or readiness_score between 0 and 100),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, version),
  unique (id, project_id)
);

create table public.flow_project_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  health text not null check (health in ('unknown', 'on_track', 'at_risk', 'off_track')),
  confidence numeric(5,2) check (confidence is null or confidence between 0 and 100),
  schedule_score numeric(5,2) check (schedule_score is null or schedule_score between 0 and 100),
  budget_score numeric(5,2) check (budget_score is null or budget_score between 0 and 100),
  capacity_score numeric(5,2) check (capacity_score is null or capacity_score between 0 and 100),
  risk_score numeric(5,2) check (risk_score is null or risk_score between 0 and 100),
  rationale text,
  signals jsonb not null default '{}'::jsonb check (jsonb_typeof(signals) = 'object'),
  captured_at timestamptz not null default now()
);

create table public.flow_status_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('on_track', 'at_risk', 'off_track', 'complete')),
  summary text not null,
  accomplishments text,
  next_steps text,
  blockers text,
  confidence numeric(5,2) check (confidence is null or confidence between 0 and 100),
  period_start date,
  period_end date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end is null or period_start is null or period_end >= period_start),
  unique (id, project_id)
);

create table public.flow_checkins (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  title text not null,
  prompt text not null,
  cadence text not null default 'weekly' check (cadence in ('once', 'daily', 'weekly', 'biweekly', 'monthly', 'custom')),
  schedule jsonb not null default '{}'::jsonb check (jsonb_typeof(schedule) = 'object'),
  audience jsonb not null default '{}'::jsonb check (jsonb_typeof(audience) = 'object'),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id)
);

create table public.flow_checkin_responses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  checkin_id uuid not null references public.flow_checkins(id) on delete cascade,
  respondent_id uuid references auth.users(id) on delete set null,
  response text not null,
  confidence numeric(5,2) check (confidence is null or confidence between 0 and 100),
  sentiment text check (sentiment is null or sentiment in ('positive', 'neutral', 'negative', 'unknown')),
  submitted_at timestamptz not null default now(),
  foreign key (checkin_id, project_id) references public.flow_checkins(id, project_id) on delete cascade
);

create table public.flow_external_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  title text not null,
  url text not null check (url ~* '^https?://'),
  icon text not null default 'ExternalLink',
  text_color text not null default '#737373',
  show_on_topbar boolean not null default true,
  show_on_dashboard boolean not null default true,
  open_in_new_tab boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, url)
);

create table public.flow_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text,
  source_id uuid,
  title text not null,
  description text not null,
  type text not null,
  read boolean not null default false,
  icon text not null default 'Bell',
  icon_color text not null default 'text-text-secondary',
  bg_color text not null default 'bg-surface-card',
  action_url text,
  extra jsonb not null default '{}'::jsonb,
  time timestamptz not null default now(),
  scheduled_for timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.flow_notification_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  channel text not null check (channel in ('in_app', 'email', 'push', 'slack', 'teams', 'webhook')),
  event_type text not null,
  enabled boolean not null default true,
  digest text not null default 'immediate' check (digest in ('immediate', 'hourly', 'daily', 'weekly', 'never')),
  quiet_hours jsonb not null default '{}'::jsonb check (jsonb_typeof(quiet_hours) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, channel, event_type)
);

create table public.flow_sso_providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  provider_type text not null check (provider_type in ('saml', 'oidc')),
  name text not null,
  status text not null default 'disabled' check (status in ('disabled', 'testing', 'active', 'error')),
  domains citext[] not null default array[]::citext[],
  metadata_url text,
  client_id text,
  secret_ref text,
  configuration jsonb not null default '{}'::jsonb check (jsonb_typeof(configuration) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.flow_scim_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  provider text not null,
  status text not null default 'disabled' check (status in ('disabled', 'active', 'error')),
  token_fingerprint text,
  secret_ref text,
  last_synced_at timestamptz,
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create table public.flow_api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default array[]::text[],
  status text not null default 'active' check (status in ('active', 'revoked', 'expired', 'rotate')),
  created_by uuid references auth.users(id) on delete set null,
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (organization_id is not null or project_id is not null)
);

create table public.flow_security_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  policy_key text not null,
  name text not null,
  description text,
  enabled boolean not null default false,
  enforcement text not null default 'monitor' check (enforcement in ('disabled', 'monitor', 'enforce')),
  configuration jsonb not null default '{}'::jsonb check (jsonb_typeof(configuration) = 'object'),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (organization_id is not null or project_id is not null),
  unique nulls not distinct (organization_id, project_id, policy_key)
);

create table public.flow_ip_allowlist (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  network cidr not null,
  description text,
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (organization_id is not null or project_id is not null),
  unique nulls not distinct (organization_id, project_id, network)
);

create table public.flow_data_retention_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  entity_type text not null,
  retention_days integer not null check (retention_days > 0),
  disposition text not null default 'delete' check (disposition in ('archive', 'anonymize', 'delete')),
  legal_hold boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (organization_id is not null or project_id is not null),
  unique nulls not distinct (organization_id, project_id, entity_type)
);

create table public.flow_encryption_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  provider text not null,
  key_ref text not null,
  purpose text not null,
  status text not null default 'active' check (status in ('active', 'rotating', 'retired', 'revoked')),
  algorithm text not null default 'AES-256-GCM',
  activated_at timestamptz not null default now(),
  rotated_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  unique (organization_id, key_ref)
);

create index flow_profiles_organization_idx on public.flow_profiles (organization_id);
create index flow_workspace_roles_org_idx on public.flow_workspace_roles (organization_id);
create index flow_role_permissions_permission_idx on public.flow_role_permissions (organization_id, permission_key);
create index flow_organization_members_user_idx on public.flow_organization_members (user_id, status);
create index flow_invitations_org_status_idx on public.flow_invitations (organization_id, status, expires_at);
create index flow_teams_project_idx on public.flow_teams (project_id);
create index flow_portfolios_org_status_idx on public.flow_portfolios (organization_id, status);
create index flow_programs_portfolio_status_idx on public.flow_programs (portfolio_id, status);
create index flow_projects_org_status_idx on public.flow_projects (organization_id, status);
create index flow_projects_portfolio_idx on public.flow_projects (portfolio_id, health, status);
create index flow_projects_program_idx on public.flow_projects (program_id, status);
create index flow_projects_search_idx on public.flow_projects using gin (search_vector);
create index flow_projects_tags_idx on public.flow_projects using gin (tags);
create index flow_project_members_project_idx on public.flow_project_members (project_id, status);
create index flow_project_members_user_idx on public.flow_project_members (user_id, status);
create unique index flow_project_members_project_user_unique_idx
  on public.flow_project_members (project_id, user_id)
  where user_id is not null;
create unique index flow_project_members_project_email_unique_idx
  on public.flow_project_members (project_id, email)
  where email is not null;
create index flow_project_phases_project_order_idx on public.flow_project_phases (project_id, sort_order);
create index flow_workstreams_project_status_idx on public.flow_workstreams (project_id, status);
create index flow_releases_project_target_idx on public.flow_releases (project_id, status, target_at);
create index flow_project_health_project_time_idx on public.flow_project_health_snapshots (project_id, captured_at desc);
create index flow_project_health_org_time_idx on public.flow_project_health_snapshots (organization_id, captured_at desc);
create index flow_status_updates_project_time_idx on public.flow_status_updates (project_id, created_at desc);
create index flow_checkin_responses_project_time_idx on public.flow_checkin_responses (project_id, submitted_at desc);
create index flow_external_links_project_order_idx on public.flow_external_links (project_id, sort_order);
create index flow_notifications_user_read_idx on public.flow_notifications (user_id, read, time desc);
create index flow_notifications_unread_idx on public.flow_notifications (user_id, time desc) where read = false;
create index flow_api_keys_project_status_idx on public.flow_api_keys (project_id, status);
create index flow_security_policies_project_idx on public.flow_security_policies (project_id, enabled);
