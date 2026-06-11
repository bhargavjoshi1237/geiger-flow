-- Integrations, analytics, automation, governance, and operational controls.

create table public.flow_addons (
  id uuid primary key default gen_random_uuid(),
  addon_key text not null unique,
  name text not null,
  description text,
  version text not null default '1.0.0',
  category text,
  color text,
  features text[] not null default array[]::text[],
  manifest jsonb not null default '{}'::jsonb check (jsonb_typeof(manifest) = 'object'),
  status text not null default 'active' check (status in ('draft', 'active', 'deprecated', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_project_addons (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  addon_key text not null references public.flow_addons(addon_key) on delete cascade,
  enabled boolean not null default true,
  nav_position integer,
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  enabled_by uuid references auth.users(id) on delete set null,
  enabled_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, addon_key)
);

-- Compatibility store for add-on records not yet promoted to a first-class table.
create table public.flow_project_plus_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  addon_key text not null,
  code text not null,
  title text not null,
  description text,
  owner text,
  due text,
  status text,
  status_tone text,
  signal_label text,
  signal text,
  progress smallint not null default 0 check (progress between 0 and 100),
  view text,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, addon_key, code)
);

create table public.flow_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  provider text not null,
  name text not null,
  status text not null default 'available' check (status in ('available', 'connecting', 'connected', 'degraded', 'disabled', 'error')),
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  credential_ref text,
  scopes text[] not null default array[]::text[],
  connected_by uuid references auth.users(id) on delete set null,
  connected_at timestamptz,
  last_health_check_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider, name),
  unique (id, organization_id)
);

create table public.flow_integration_mappings (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.flow_integrations(id) on delete cascade,
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  local_entity_type text not null,
  local_entity_id uuid,
  remote_entity_type text not null,
  remote_entity_id text not null,
  remote_url text,
  sync_direction text not null default 'bidirectional' check (sync_direction in ('inbound', 'outbound', 'bidirectional')),
  sync_state jsonb not null default '{}'::jsonb check (jsonb_typeof(sync_state) = 'object'),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (integration_id, organization_id) references public.flow_integrations(id, organization_id) on delete cascade,
  unique (integration_id, remote_entity_type, remote_entity_id)
);

create table public.flow_integration_sync_runs (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.flow_integrations(id) on delete cascade,
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound', 'bidirectional')),
  trigger_type text not null default 'scheduled' check (trigger_type in ('manual', 'scheduled', 'webhook', 'retry')),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'partial', 'failed', 'cancelled')),
  cursor text,
  records_read integer not null default 0 check (records_read >= 0),
  records_written integer not null default 0 check (records_written >= 0),
  records_failed integer not null default 0 check (records_failed >= 0),
  error_summary text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (integration_id, organization_id) references public.flow_integrations(id, organization_id) on delete cascade,
  check (completed_at is null or started_at is null or completed_at >= started_at)
);

create table public.flow_integration_sync_events (
  id bigint generated always as identity primary key,
  sync_run_id uuid not null references public.flow_integration_sync_runs(id) on delete cascade,
  level text not null default 'info' check (level in ('debug', 'info', 'warning', 'error')),
  entity_type text,
  entity_id text,
  message text not null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create table public.flow_webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  name text not null,
  url text not null check (url ~ '^https://'),
  event_types text[] not null,
  secret_ref text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'disabled')),
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.flow_webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  endpoint_id uuid not null references public.flow_webhook_endpoints(id) on delete cascade,
  event_id uuid not null,
  event_type text not null,
  attempt integer not null default 1 check (attempt > 0),
  status text not null default 'pending' check (status in ('pending', 'delivering', 'succeeded', 'failed', 'abandoned')),
  response_status integer,
  response_body text,
  error_message text,
  next_attempt_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (endpoint_id, event_id, attempt)
);

create table public.flow_datasets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  integration_id uuid references public.flow_integrations(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  source_type text not null check (source_type in ('database', 'file', 'api', 'integration', 'derived')),
  source_config jsonb not null default '{}'::jsonb check (jsonb_typeof(source_config) = 'object'),
  classification text not null default 'internal' check (classification in ('public', 'internal', 'confidential', 'restricted')),
  refresh_mode text not null default 'manual' check (refresh_mode in ('manual', 'scheduled', 'streaming')),
  refresh_schedule text,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'error', 'archived')),
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug),
  unique (id, organization_id)
);

create table public.flow_dataset_versions (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.flow_datasets(id) on delete cascade,
  version integer not null check (version > 0),
  schema_definition jsonb not null default '{}'::jsonb check (jsonb_typeof(schema_definition) = 'object'),
  row_count bigint check (row_count is null or row_count >= 0),
  storage_location text,
  checksum text,
  status text not null default 'ready' check (status in ('building', 'ready', 'failed', 'superseded')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (dataset_id, version)
);

create table public.flow_dataset_fields (
  id uuid primary key default gen_random_uuid(),
  dataset_version_id uuid not null references public.flow_dataset_versions(id) on delete cascade,
  field_name text not null,
  display_name text,
  data_type text not null,
  ordinal integer not null check (ordinal >= 0),
  nullable boolean not null default true,
  is_dimension boolean not null default false,
  is_measure boolean not null default false,
  semantic_type text,
  description text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  unique (dataset_version_id, field_name),
  unique (dataset_version_id, ordinal)
);

create table public.flow_dataset_refresh_runs (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.flow_datasets(id) on delete cascade,
  dataset_version_id uuid references public.flow_dataset_versions(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  rows_processed bigint not null default 0 check (rows_processed >= 0),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at)
);

create table public.flow_sql_queries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  dataset_id uuid references public.flow_datasets(id) on delete set null,
  name text,
  query text not null,
  parameters jsonb not null default '{}'::jsonb check (jsonb_typeof(parameters) = 'object'),
  result_preview jsonb,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  row_count bigint check (row_count is null or row_count >= 0),
  status text not null default 'saved' check (status in ('draft', 'saved', 'running', 'succeeded', 'failed', 'archived')),
  visibility text not null default 'project' check (visibility in ('private', 'project', 'organization')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  executed_at timestamptz
);

create table public.flow_query_runs (
  id uuid primary key default gen_random_uuid(),
  query_id uuid references public.flow_sql_queries(id) on delete set null,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  statement_hash text not null,
  parameter_values jsonb not null default '{}'::jsonb check (jsonb_typeof(parameter_values) = 'object'),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'timed_out')),
  row_count bigint check (row_count is null or row_count >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  result_ref text,
  error_message text,
  executed_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at)
);

create table public.flow_saved_views (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  name text not null,
  visibility text not null default 'private' check (visibility in ('private', 'project', 'organization', 'public')),
  filters jsonb not null default '{}'::jsonb check (jsonb_typeof(filters) = 'object'),
  sort jsonb not null default '[]'::jsonb check (jsonb_typeof(sort) = 'array'),
  grouping jsonb not null default '[]'::jsonb check (jsonb_typeof(grouping) = 'array'),
  columns jsonb not null default '[]'::jsonb check (jsonb_typeof(columns) = 'array'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_dashboards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  name text not null,
  description text,
  visibility text not null default 'project' check (visibility in ('private', 'project', 'organization', 'public')),
  layout jsonb not null default '{}'::jsonb check (jsonb_typeof(layout) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.flow_dashboards(id) on delete cascade,
  widget_type text not null,
  title text,
  dataset_id uuid references public.flow_datasets(id) on delete set null,
  query_id uuid references public.flow_sql_queries(id) on delete set null,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  position jsonb not null default '{}'::jsonb check (jsonb_typeof(position) = 'object'),
  refresh_interval_seconds integer check (refresh_interval_seconds is null or refresh_interval_seconds >= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  dashboard_id uuid references public.flow_dashboards(id) on delete set null,
  name text not null,
  view text not null,
  date_range daterange,
  filters jsonb not null default '{}'::jsonb check (jsonb_typeof(filters) = 'object'),
  rows jsonb not null default '[]'::jsonb check (jsonb_typeof(rows) = 'array'),
  metrics jsonb not null default '{}'::jsonb check (jsonb_typeof(metrics) = 'object'),
  output_format text not null default 'app' check (output_format in ('app', 'pdf', 'csv', 'xlsx', 'json')),
  output_ref text,
  status text not null default 'ready' check (status in ('queued', 'generating', 'ready', 'failed', 'expired')),
  generated_by uuid references auth.users(id) on delete set null,
  generated_at timestamptz not null default now(),
  expires_at timestamptz
);

create table public.flow_report_schedules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  dashboard_id uuid references public.flow_dashboards(id) on delete cascade,
  name text not null,
  cron_expression text not null,
  timezone text not null default 'UTC',
  output_format text not null default 'pdf' check (output_format in ('pdf', 'csv', 'xlsx')),
  recipients jsonb not null default '[]'::jsonb check (jsonb_typeof(recipients) = 'array'),
  filters jsonb not null default '{}'::jsonb check (jsonb_typeof(filters) = 'object'),
  enabled boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_automation_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  name text not null,
  description text,
  trigger_type text not null,
  trigger_config jsonb not null default '{}'::jsonb check (jsonb_typeof(trigger_config) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'disabled', 'archived')),
  run_as_user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table public.flow_automation_rule_versions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.flow_automation_rules(id) on delete cascade,
  version integer not null check (version > 0),
  conditions jsonb not null default '[]'::jsonb check (jsonb_typeof(conditions) = 'array'),
  actions jsonb not null default '[]'::jsonb check (jsonb_typeof(actions) = 'array'),
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (rule_id, version)
);

create table public.flow_automation_runs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.flow_automation_rules(id) on delete cascade,
  rule_version_id uuid references public.flow_automation_rule_versions(id) on delete set null,
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  trigger_event_id uuid,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'partial', 'failed', 'cancelled')),
  input jsonb not null default '{}'::jsonb check (jsonb_typeof(input) = 'object'),
  output jsonb not null default '{}'::jsonb check (jsonb_typeof(output) = 'object'),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (rule_id, organization_id) references public.flow_automation_rules(id, organization_id) on delete cascade,
  check (completed_at is null or started_at is null or completed_at >= started_at)
);

create table public.flow_automation_run_steps (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.flow_automation_runs(id) on delete cascade,
  step_index integer not null check (step_index >= 0),
  action_type text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'skipped')),
  input jsonb not null default '{}'::jsonb check (jsonb_typeof(input) = 'object'),
  output jsonb not null default '{}'::jsonb check (jsonb_typeof(output) = 'object'),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  unique (run_id, step_index)
);

create table public.flow_scenarios (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  description text,
  scenario_type text not null default 'what_if' check (scenario_type in ('what_if', 'forecast', 'recovery', 'optimization')),
  status text not null default 'draft' check (status in ('draft', 'running', 'ready', 'adopted', 'archived')),
  assumptions jsonb not null default '{}'::jsonb check (jsonb_typeof(assumptions) = 'object'),
  results jsonb not null default '{}'::jsonb check (jsonb_typeof(results) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

create table public.flow_scenario_changes (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.flow_scenarios(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  operation text not null check (operation in ('create', 'update', 'delete')),
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create table public.flow_project_baselines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  baseline_type text not null default 'full' check (baseline_type in ('schedule', 'cost', 'scope', 'full')),
  version integer not null check (version > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (project_id, baseline_type, version)
);

create table public.flow_change_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  change_type text not null check (change_type in ('scope', 'schedule', 'cost', 'quality', 'resource', 'technical', 'other')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'implemented', 'cancelled')),
  requested_by uuid references auth.users(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  decision_id uuid,
  requested_at timestamptz,
  decided_at timestamptz,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, code)
);

create table public.flow_change_request_impacts (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null references public.flow_change_requests(id) on delete cascade,
  impact_type text not null check (impact_type in ('scope', 'schedule', 'cost', 'quality', 'resource', 'risk', 'benefit')),
  description text not null,
  amount numeric(18,2),
  duration_days integer,
  severity text check (severity is null or severity in ('low', 'medium', 'high', 'critical')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object')
);

create table public.flow_risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  category text,
  status text not null default 'open' check (status in ('identified', 'open', 'mitigating', 'accepted', 'occurred', 'closed')),
  probability smallint not null default 1 check (probability between 1 and 5),
  impact smallint not null default 1 check (impact between 1 and 5),
  score smallint generated always as (probability * impact) stored,
  owner_id uuid references auth.users(id) on delete set null,
  response_strategy text check (response_strategy is null or response_strategy in ('avoid', 'mitigate', 'transfer', 'accept', 'exploit', 'enhance', 'share')),
  trigger_description text,
  review_date date,
  occurred_at timestamptz,
  closed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, code)
);

create table public.flow_risk_actions (
  id uuid primary key default gen_random_uuid(),
  risk_id uuid not null references public.flow_risks(id) on delete cascade,
  title text not null,
  owner_id uuid references auth.users(id) on delete set null,
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  code text not null,
  title text not null,
  context text,
  decision text,
  rationale text,
  status text not null default 'proposed' check (status in ('proposed', 'under_review', 'decided', 'superseded', 'reversed')),
  owner_id uuid references auth.users(id) on delete set null,
  decided_by uuid references auth.users(id) on delete set null,
  due_date date,
  decided_at timestamptz,
  supersedes_id uuid references public.flow_decisions(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, code)
);

alter table public.flow_change_requests
  add constraint flow_change_requests_decision_fk
  foreign key (decision_id) references public.flow_decisions(id) on delete set null;

create table public.flow_decision_options (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.flow_decisions(id) on delete cascade,
  title text not null,
  description text,
  pros text[] not null default array[]::text[],
  cons text[] not null default array[]::text[],
  score numeric(12,4),
  selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.flow_readiness_checklists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  release_id uuid references public.flow_releases(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'ready', 'not_ready', 'closed')),
  due_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_readiness_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.flow_readiness_checklists(id) on delete cascade,
  title text not null,
  category text,
  owner_id uuid references auth.users(id) on delete set null,
  required boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'passed', 'failed', 'waived')),
  evidence text,
  due_at timestamptz,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_readiness_signoffs (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.flow_readiness_checklists(id) on delete cascade,
  signer_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('approved', 'rejected', 'approved_with_conditions')),
  comment text,
  signed_at timestamptz not null default now(),
  unique (checklist_id, signer_id)
);

create table public.flow_feedback (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  source text not null default 'manual',
  source_ref text,
  submitted_by uuid references auth.users(id) on delete set null,
  contact_ref text,
  title text,
  body text not null,
  sentiment numeric(5,2) check (sentiment is null or sentiment between -1 and 1),
  status text not null default 'new' check (status in ('new', 'triaged', 'planned', 'resolved', 'dismissed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_feedback_themes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'merged', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, project_id, name)
);

create table public.flow_feedback_theme_links (
  feedback_id uuid not null references public.flow_feedback(id) on delete cascade,
  theme_id uuid not null references public.flow_feedback_themes(id) on delete cascade,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  linked_by uuid references auth.users(id) on delete set null,
  linked_at timestamptz not null default now(),
  primary key (feedback_id, theme_id)
);

create table public.flow_experiments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  hypothesis text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
  owner_id uuid references auth.users(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  targeting jsonb not null default '{}'::jsonb check (jsonb_typeof(targeting) = 'object'),
  conclusion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at),
  unique (project_id, name)
);

create table public.flow_experiment_variants (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.flow_experiments(id) on delete cascade,
  name text not null,
  is_control boolean not null default false,
  allocation_percent numeric(5,2) not null check (allocation_percent between 0 and 100),
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  unique (experiment_id, name)
);

create table public.flow_experiment_metrics (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.flow_experiments(id) on delete cascade,
  name text not null,
  metric_key text not null,
  role text not null default 'primary' check (role in ('primary', 'secondary', 'guardrail')),
  direction text not null default 'increase' check (direction in ('increase', 'decrease', 'neutral')),
  definition jsonb not null default '{}'::jsonb check (jsonb_typeof(definition) = 'object'),
  unique (experiment_id, metric_key)
);

create table public.flow_experiment_results (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.flow_experiments(id) on delete cascade,
  variant_id uuid not null references public.flow_experiment_variants(id) on delete cascade,
  metric_id uuid not null references public.flow_experiment_metrics(id) on delete cascade,
  observed_at timestamptz not null,
  sample_size bigint not null check (sample_size >= 0),
  value numeric(30,10),
  lift numeric(18,8),
  confidence numeric(8,6) check (confidence is null or confidence between 0 and 1),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  unique (variant_id, metric_id, observed_at)
);

create table public.flow_incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete set null,
  code text not null,
  title text not null,
  description text,
  severity text not null check (severity in ('sev1', 'sev2', 'sev3', 'sev4')),
  status text not null default 'investigating' check (status in ('investigating', 'identified', 'monitoring', 'resolved', 'closed')),
  commander_id uuid references auth.users(id) on delete set null,
  started_at timestamptz not null,
  detected_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  customer_impact text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.flow_incident_responders (
  incident_id uuid not null references public.flow_incidents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'responder',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (incident_id, user_id)
);

create table public.flow_incident_timeline (
  id bigint generated always as identity primary key,
  incident_id uuid not null references public.flow_incidents(id) on delete cascade,
  event_type text not null,
  message text not null,
  actor_id uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  occurred_at timestamptz not null default now()
);

create table public.flow_incident_postmortems (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null unique references public.flow_incidents(id) on delete cascade,
  summary text not null,
  root_cause text,
  contributing_factors text[] not null default array[]::text[],
  lessons_learned text,
  status text not null default 'draft' check (status in ('draft', 'review', 'published')),
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_security_settings (
  project_id uuid primary key references public.flow_projects(id) on delete cascade,
  read_only boolean not null default false,
  maintenance_mode boolean not null default false,
  audit_logging boolean not null default true,
  rate_limiting boolean not null default true,
  ip_restriction boolean not null default false,
  request_signing boolean not null default true,
  allowed_networks cidr[] not null default array[]::cidr[],
  signing_key_refs text[] not null default array[]::text[],
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.flow_security_findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  integration_id uuid references public.flow_integrations(id) on delete set null,
  finding_type text not null,
  title text not null,
  description text,
  severity text not null check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'remediating', 'resolved', 'accepted', 'false_positive')),
  fingerprint text not null,
  owner_id uuid references auth.users(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz,
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object'),
  remediation text,
  unique (organization_id, fingerprint)
);

create table public.flow_access_events (
  id bigint generated always as identity primary key,
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  outcome text not null check (outcome in ('allowed', 'denied', 'challenged', 'error')),
  resource_type text,
  resource_id text,
  ip_address inet,
  user_agent text,
  reason text,
  created_at timestamptz not null default now()
);

create table public.flow_audit_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.flow_projects(id) on delete cascade,
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'user' check (actor_type in ('user', 'service', 'system', 'integration')),
  action text not null,
  subject_type text,
  subject_id uuid,
  correlation_id uuid,
  ip_address inet,
  network cidr,
  user_agent text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  check (organization_id is not null or project_id is not null)
);

create table public.flow_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  job_type text not null,
  queue text not null default 'default',
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'dead')),
  priority integer not null default 100,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  result jsonb,
  idempotency_key text,
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 5 check (max_attempts > 0),
  run_after timestamptz not null default now(),
  locked_by text,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_outbox_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  aggregate_type text not null,
  aggregate_id uuid not null,
  event_type text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  headers jsonb not null default '{}'::jsonb check (jsonb_typeof(headers) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'publishing', 'published', 'failed', 'dead')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  published_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index flow_project_addons_project_idx on public.flow_project_addons (project_id, enabled);
create index flow_project_plus_items_project_addon_idx on public.flow_project_plus_items (project_id, addon_key, status);
create index flow_integrations_org_provider_idx on public.flow_integrations (organization_id, provider, status);
create index flow_integration_mappings_local_idx on public.flow_integration_mappings (local_entity_type, local_entity_id);
create unique index flow_integration_mappings_local_unique_idx
  on public.flow_integration_mappings (integration_id, local_entity_type, local_entity_id)
  where local_entity_id is not null;
create index flow_integration_sync_runs_status_idx on public.flow_integration_sync_runs (integration_id, status, created_at desc);
create index flow_integration_sync_events_run_idx on public.flow_integration_sync_events (sync_run_id, created_at);
create index flow_webhook_deliveries_retry_idx on public.flow_webhook_deliveries (status, next_attempt_at) where status in ('pending', 'failed');
create index flow_datasets_org_status_idx on public.flow_datasets (organization_id, status, updated_at desc);
create index flow_dataset_refresh_runs_status_idx on public.flow_dataset_refresh_runs (dataset_id, status, created_at desc);
create index flow_sql_queries_project_idx on public.flow_sql_queries (project_id, created_at desc);
create index flow_query_runs_project_idx on public.flow_query_runs (project_id, created_at desc);
create index flow_saved_views_scope_idx on public.flow_saved_views (organization_id, project_id, entity_type, visibility);
create index flow_dashboards_scope_idx on public.flow_dashboards (organization_id, project_id, visibility);
create index flow_reports_project_view_idx on public.flow_reports (project_id, view, generated_at desc);
create index flow_report_schedules_due_idx on public.flow_report_schedules (next_run_at) where enabled = true;
create index flow_automation_rules_scope_idx on public.flow_automation_rules (organization_id, project_id, status);
create index flow_automation_runs_status_idx on public.flow_automation_runs (status, created_at) where status in ('queued', 'running');
create index flow_scenarios_project_idx on public.flow_scenarios (project_id, status, updated_at desc);
create index flow_change_requests_project_idx on public.flow_change_requests (project_id, status, priority, created_at desc);
create index flow_risks_project_score_idx on public.flow_risks (project_id, status, score desc);
create index flow_decisions_project_idx on public.flow_decisions (project_id, status, created_at desc);
create unique index flow_decision_options_selected_idx on public.flow_decision_options (decision_id) where selected = true;
create index flow_readiness_checklists_release_idx on public.flow_readiness_checklists (release_id, status);
create index flow_feedback_scope_idx on public.flow_feedback (organization_id, project_id, status, received_at desc);
create index flow_experiments_project_idx on public.flow_experiments (project_id, status, starts_at);
create index flow_incidents_org_status_idx on public.flow_incidents (organization_id, status, severity, started_at desc);
create index flow_incident_timeline_time_idx on public.flow_incident_timeline (incident_id, occurred_at);
create index flow_security_findings_scope_idx on public.flow_security_findings (organization_id, project_id, status, severity);
create index flow_access_events_org_time_idx on public.flow_access_events (organization_id, created_at desc);
create index flow_audit_events_project_time_idx on public.flow_audit_events (project_id, created_at desc);
create index flow_audit_events_org_time_idx on public.flow_audit_events (organization_id, created_at desc);
create unique index flow_jobs_idempotency_idx
  on public.flow_jobs (job_type, idempotency_key)
  where idempotency_key is not null;
create index flow_jobs_claim_idx on public.flow_jobs (queue, priority, run_after, created_at)
  where status = 'queued';
create index flow_outbox_publish_idx on public.flow_outbox_events (available_at, created_at)
  where status in ('pending', 'failed');
