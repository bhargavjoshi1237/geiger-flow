create table public.flow_strategies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  parent_id uuid references public.flow_strategies(id) on delete set null,
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  horizon_start date,
  horizon_end date,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (horizon_end is null or horizon_start is null or horizon_end >= horizon_start),
  unique (id, organization_id)
);

create table public.flow_initiatives (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  strategy_id uuid references public.flow_strategies(id) on delete set null,
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'active', 'on_hold', 'completed', 'cancelled')),
  priority_score numeric(10,4),
  starts_on date,
  target_date date,
  budget numeric(18,2) check (budget is null or budget >= 0),
  currency char(3) not null default 'USD',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (target_date is null or starts_on is null or target_date >= starts_on),
  unique (id, organization_id),
  unique (id, project_id)
);

create table public.flow_objectives (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  parent_id uuid references public.flow_objectives(id) on delete set null,
  strategy_id uuid references public.flow_strategies(id) on delete set null,
  initiative_id uuid references public.flow_initiatives(id) on delete set null,
  title text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  owner text,
  status text not null default 'not_started' check (status in ('not_started', 'on_track', 'at_risk', 'off_track', 'completed', 'cancelled')),
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  start_date date,
  target_date date,
  visibility text not null default 'project' check (visibility in ('private', 'project', 'organization', 'public')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (target_date is null or start_date is null or target_date >= start_date),
  unique (id, project_id),
  unique (id, organization_id)
);

create table public.flow_objective_key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.flow_objectives(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  label text not null,
  description text,
  metric_key text,
  unit text,
  start_value numeric(20,6) not null default 0,
  current_value numeric(20,6) not null default 0,
  target_value numeric(20,6) not null default 100,
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  done boolean not null default false,
  owner_id uuid references auth.users(id) on delete set null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (objective_id, project_id) references public.flow_objectives(id, project_id) on delete cascade
);

create table public.flow_goals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  parent_id uuid references public.flow_goals(id) on delete set null,
  strategy_id uuid references public.flow_strategies(id) on delete set null,
  initiative_id uuid references public.flow_initiatives(id) on delete set null,
  title text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  owner text,
  status text not null default 'not_started' check (status in ('not_started', 'on_track', 'at_risk', 'off_track', 'completed', 'cancelled')),
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  progress_source text not null default 'manual' check (progress_source in ('manual', 'key_results', 'tasks', 'metric')),
  metric_key text,
  start_value numeric(20,6),
  current_value numeric(20,6),
  target_value numeric(20,6),
  unit text,
  start_date date,
  target_date date,
  visibility text not null default 'project' check (visibility in ('private', 'project', 'organization', 'public')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (target_date is null or start_date is null or target_date >= start_date),
  unique (id, project_id),
  unique (id, organization_id)
);

create table public.flow_goal_key_results (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.flow_goals(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  title text not null,
  description text,
  metric_key text,
  unit text,
  start_value numeric(20,6) not null default 0,
  current_value numeric(20,6) not null default 0,
  target_value numeric(20,6) not null default 100,
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  done boolean not null default false,
  owner_id uuid references auth.users(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (goal_id, project_id) references public.flow_goals(id, project_id) on delete cascade
);

create table public.flow_objective_goal_links (
  objective_id uuid not null references public.flow_objectives(id) on delete cascade,
  goal_id uuid not null references public.flow_goals(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  weight numeric(7,4) not null default 1 check (weight > 0),
  created_at timestamptz not null default now(),
  primary key (objective_id, goal_id),
  foreign key (objective_id, project_id) references public.flow_objectives(id, project_id) on delete cascade,
  foreign key (goal_id, project_id) references public.flow_goals(id, project_id) on delete cascade
);

create table public.flow_alignment_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  source_type text not null,
  source_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  relationship text not null default 'supports' check (relationship in ('supports', 'depends_on', 'contributes_to', 'measures', 'delivers', 'blocks')),
  weight numeric(7,4) not null default 1 check (weight > 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (source_type <> target_type or source_id <> target_id),
  unique (source_type, source_id, target_type, target_id, relationship)
);

create table public.flow_benefits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  initiative_id uuid references public.flow_initiatives(id) on delete set null,
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  metric_key text,
  unit text,
  baseline_value numeric(20,6),
  target_value numeric(20,6),
  realized_value numeric(20,6),
  target_date date,
  realized_at timestamptz,
  status text not null default 'planned' check (status in ('planned', 'tracking', 'realized', 'missed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  phase_id uuid references public.flow_project_phases(id) on delete set null,
  workstream_id uuid references public.flow_workstreams(id) on delete set null,
  release_id uuid references public.flow_releases(id) on delete set null,
  title text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  owner text,
  status text not null default 'not_started' check (status in ('not_started', 'on_track', 'at_risk', 'off_track', 'completed', 'cancelled')),
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  start_date date,
  due_on date,
  baseline_due_on date,
  completed_at timestamptz,
  is_gate boolean not null default false,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_on is null or start_date is null or due_on >= start_date),
  unique (id, project_id)
);

create table public.flow_task_collections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  slug citext not null,
  description text,
  color text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, slug),
  unique (id, project_id)
);

create table public.flow_labels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name citext not null,
  color text,
  description text,
  created_at timestamptz not null default now(),
  unique (project_id, name),
  unique (id, project_id)
);

create table public.flow_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  collection_id uuid references public.flow_task_collections(id) on delete set null,
  parent_task_id uuid references public.flow_tasks(id) on delete set null,
  phase_id uuid references public.flow_project_phases(id) on delete set null,
  workstream_id uuid references public.flow_workstreams(id) on delete set null,
  release_id uuid references public.flow_releases(id) on delete set null,
  milestone_id uuid references public.flow_milestones(id) on delete set null,
  objective_id uuid references public.flow_objectives(id) on delete set null,
  goal_id uuid references public.flow_goals(id) on delete set null,
  initiative_id uuid references public.flow_initiatives(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('draft', 'todo', 'in_progress', 'blocked', 'in_review', 'done', 'cancelled', 'archived')),
  priority text not null default 'medium' check (priority in ('none', 'low', 'medium', 'high', 'critical')),
  stage text not null default 'backlog',
  type text not null default 'task' check (type in ('task', 'issue', 'bug', 'feature', 'improvement', 'research', 'approval', 'deliverable')),
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  labels text[] not null default array[]::text[],
  assignee_ids uuid[] not null default array[]::uuid[],
  parent_type text,
  parent_id uuid,
  parent_link text,
  initiative_link text,
  start_date date,
  due_date date,
  baseline_start_date date,
  baseline_due_date date,
  time_block tstzrange,
  estimate interval,
  remaining_estimate interval,
  deadline_tracking text not null default 'on_track' check (deadline_tracking in ('on_track', 'at_risk', 'overdue', 'not_set')),
  git_branch text,
  git_refs text[] not null default array[]::text[],
  reminders text[] not null default array[]::text[],
  role_visibility text not null default 'team' check (role_visibility in ('team', 'pm_tl', 'dev_only', 'private')),
  inbox jsonb not null default '{}'::jsonb check (jsonb_typeof(inbox) = 'object'),
  integrations jsonb not null default '{}'::jsonb check (jsonb_typeof(integrations) = 'object'),
  assist_panel jsonb not null default '{}'::jsonb check (jsonb_typeof(assist_panel) = 'object'),
  latest_update text,
  custom_fields jsonb not null default '{}'::jsonb check (jsonb_typeof(custom_fields) = 'object'),
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(latest_update, ''))
  ) stored,
  created_by uuid references auth.users(id) on delete set null,
  completed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  check (due_date is null or start_date is null or due_date >= start_date),
  check (baseline_due_date is null or baseline_start_date is null or baseline_due_date >= baseline_start_date),
  unique (id, project_id)
);

create table public.flow_task_assignees (
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_type text not null default 'owner' check (assignment_type in ('owner', 'contributor', 'reviewer', 'approver')),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (task_id, user_id, assignment_type),
  foreign key (task_id, project_id) references public.flow_tasks(id, project_id) on delete cascade
);

create table public.flow_task_labels (
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  label_id uuid not null references public.flow_labels(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  primary key (task_id, label_id),
  foreign key (task_id, project_id) references public.flow_tasks(id, project_id) on delete cascade,
  foreign key (label_id, project_id) references public.flow_labels(id, project_id) on delete cascade
);

create table public.flow_task_dependencies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.flow_tasks(id) on delete cascade,
  dependency_type text not null default 'finish_to_start' check (dependency_type in ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish', 'blocks', 'relates_to')),
  lag interval not null default interval '0',
  is_hard boolean not null default true,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  check (task_id <> depends_on_task_id),
  unique (task_id, depends_on_task_id, dependency_type),
  foreign key (task_id, project_id) references public.flow_tasks(id, project_id) on delete cascade,
  foreign key (depends_on_task_id, project_id) references public.flow_tasks(id, project_id) on delete cascade
);

create table public.flow_task_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  parent_id uuid references public.flow_task_comments(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  body text not null,
  body_format text not null default 'markdown' check (body_format in ('plain', 'markdown', 'rich_text')),
  mentions uuid[] not null default array[]::uuid[],
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (task_id, project_id) references public.flow_tasks(id, project_id) on delete cascade
);

create table public.flow_task_watchers (
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, user_id),
  foreign key (task_id, project_id) references public.flow_tasks(id, project_id) on delete cascade
);

create table public.flow_task_reminders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  remind_at timestamptz not null,
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'push', 'slack', 'teams')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled', 'failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (task_id, project_id) references public.flow_tasks(id, project_id) on delete cascade
);

create table public.flow_task_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  task_id uuid not null references public.flow_tasks(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  message text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now(),
  foreign key (task_id, project_id) references public.flow_tasks(id, project_id) on delete cascade
);

create table public.flow_issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  linked_task_id uuid references public.flow_tasks(id) on delete set null,
  release_id uuid references public.flow_releases(id) on delete set null,
  code text not null,
  title text not null,
  case_summary text,
  description text,
  status text not null default 'open' check (status in ('open', 'triaged', 'in_progress', 'monitoring', 'resolved', 'closed')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  issue_type text not null default 'delivery' check (issue_type in ('delivery', 'bug', 'security', 'quality', 'scope', 'dependency', 'operational')),
  assignee_id uuid references auth.users(id) on delete set null,
  reporter_id uuid references auth.users(id) on delete set null,
  owner_team_id uuid references public.flow_teams(id) on delete set null,
  environment text,
  impact text,
  affected_users text,
  due_date date,
  signals jsonb not null default '[]'::jsonb check (jsonb_typeof(signals) = 'array'),
  reproduction_steps jsonb not null default '[]'::jsonb check (jsonb_typeof(reproduction_steps) = 'array'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  closed_at timestamptz,
  unique (project_id, code),
  unique (id, project_id)
);

create table public.flow_issue_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  issue_id uuid not null references public.flow_issues(id) on delete cascade,
  parent_id uuid references public.flow_issue_comments(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (issue_id, project_id) references public.flow_issues(id, project_id) on delete cascade
);

create table public.flow_issue_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  issue_id uuid not null references public.flow_issues(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (issue_id, project_id) references public.flow_issues(id, project_id) on delete cascade
);

create table public.flow_work_queue_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  title text not null,
  description text,
  status text not null default 'queued' check (status in ('queued', 'scheduled', 'running', 'blocked', 'completed', 'cancelled', 'failed')),
  priority smallint not null default 0,
  assignee_id uuid references auth.users(id) on delete set null,
  queue_position numeric(20,8),
  scheduled_for timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, source_type, source_id)
);

create table public.flow_calendar_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  task_id uuid references public.flow_tasks(id) on delete cascade,
  milestone_id uuid references public.flow_milestones(id) on delete cascade,
  release_id uuid references public.flow_releases(id) on delete cascade,
  title text not null,
  description text,
  event_type text not null default 'event' check (event_type in ('event', 'meeting', 'deadline', 'milestone', 'reminder', 'time_block')),
  status text not null default 'confirmed' check (status in ('tentative', 'confirmed', 'cancelled', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  location text,
  recurrence jsonb not null default '{}'::jsonb check (jsonb_typeof(recurrence) = 'object'),
  tags text[] not null default array[]::text[],
  visibility text not null default 'project' check (visibility in ('private', 'project', 'organization', 'public')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at >= starts_at),
  unique (id, project_id)
);

create table public.flow_event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.flow_calendar_events(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email citext,
  response text not null default 'needs_action' check (response in ('needs_action', 'accepted', 'declined', 'tentative')),
  is_required boolean not null default true,
  responded_at timestamptz,
  foreign key (event_id, project_id) references public.flow_calendar_events(id, project_id) on delete cascade,
  check (user_id is not null or email is not null),
  unique nulls not distinct (event_id, user_id, email)
);

create table public.flow_time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  task_id uuid references public.flow_tasks(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  entry_date date not null default current_date,
  minutes integer not null check (minutes > 0),
  billable boolean not null default false,
  approved boolean not null default false,
  description text,
  source text not null default 'manual' check (source in ('manual', 'timer', 'import', 'integration')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_at is null or started_at is null or ended_at >= started_at),
  unique (id, project_id)
);

create table public.flow_timesheets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'rejected', 'locked')),
  total_minutes integer not null default 0 check (total_minutes >= 0),
  submitted_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (organization_id, user_id, period_start, period_end)
);

create table public.flow_timesheet_entries (
  timesheet_id uuid not null references public.flow_timesheets(id) on delete cascade,
  time_entry_id uuid not null references public.flow_time_entries(id) on delete cascade,
  primary key (timesheet_id, time_entry_id)
);

create table public.flow_approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'expired')),
  requested_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz not null default now(),
  due_at timestamptz,
  completed_at timestamptz,
  current_step integer not null default 1 check (current_step > 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  unique (id, project_id),
  unique (id, organization_id)
);

create table public.flow_approval_steps (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.flow_approvals(id) on delete cascade,
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  step_order integer not null check (step_order > 0),
  name text not null,
  approval_mode text not null default 'any' check (approval_mode in ('any', 'all', 'majority')),
  status text not null default 'pending' check (status in ('pending', 'active', 'approved', 'rejected', 'skipped')),
  due_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  unique (approval_id, step_order),
  foreign key (approval_id, project_id) references public.flow_approvals(id, project_id) on delete cascade,
  foreign key (approval_id, organization_id) references public.flow_approvals(id, organization_id) on delete cascade
);

create table public.flow_approval_decisions (
  id uuid primary key default gen_random_uuid(),
  approval_step_id uuid not null references public.flow_approval_steps(id) on delete cascade,
  approver_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('approved', 'rejected', 'abstained')),
  comment text,
  delegated_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz not null default now(),
  unique (approval_step_id, approver_id)
);

create table public.flow_custom_fields (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  entity_type text not null,
  key text not null check (key ~ '^[a-z][a-z0-9_]{1,62}$'),
  label text not null,
  description text,
  field_type text not null check (field_type in ('text', 'long_text', 'number', 'currency', 'percent', 'boolean', 'date', 'datetime', 'select', 'multi_select', 'user', 'relation', 'url', 'formula')),
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  validation jsonb not null default '{}'::jsonb check (jsonb_typeof(validation) = 'object'),
  default_value jsonb,
  formula text,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, project_id, entity_type, key),
  unique (id, project_id)
);

create table public.flow_custom_field_options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.flow_custom_fields(id) on delete cascade,
  value text not null,
  label text not null,
  color text,
  sort_order integer not null default 0,
  archived_at timestamptz,
  unique (field_id, value)
);

create table public.flow_custom_field_values (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  field_id uuid not null references public.flow_custom_fields(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  text_value text,
  number_value numeric(30,10),
  boolean_value boolean,
  date_value date,
  timestamp_value timestamptz,
  json_value jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(text_value, number_value, boolean_value, date_value, timestamp_value, json_value) <= 1),
  unique (field_id, entity_type, entity_id)
);

create table public.flow_demand_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete set null,
  request_type text not null,
  title text not null,
  description text,
  requester_id uuid references auth.users(id) on delete set null,
  requester_email citext,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'triage', 'needs_info', 'approved', 'rejected', 'converted', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  score numeric(12,4),
  due_at timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  converted_entity_type text,
  converted_entity_id uuid,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_demand_scores (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.flow_demand_requests(id) on delete cascade,
  criterion text not null,
  weight numeric(10,4) not null default 1 check (weight >= 0),
  score numeric(10,4) not null,
  rationale text,
  scored_by uuid references auth.users(id) on delete set null,
  scored_at timestamptz not null default now(),
  unique (request_id, criterion, scored_by)
);

create table public.flow_projections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  name text not null,
  description text,
  projection_type text not null default 'schedule' check (projection_type in ('schedule', 'capacity', 'budget', 'delivery', 'risk', 'custom')),
  status text not null default 'draft' check (status in ('draft', 'active', 'shared', 'archived')),
  visibility text not null default 'private' check (visibility in ('private', 'shared', 'public')),
  assumptions jsonb not null default '{}'::jsonb check (jsonb_typeof(assumptions) = 'object'),
  result jsonb not null default '{}'::jsonb check (jsonb_typeof(result) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id)
);

create table public.flow_projection_changes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  projection_id uuid not null references public.flow_projections(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  change_type text not null,
  before_state jsonb,
  after_state jsonb not null,
  created_at timestamptz not null default now(),
  foreign key (projection_id, project_id) references public.flow_projections(id, project_id) on delete cascade
);

create index flow_strategies_org_status_idx on public.flow_strategies (organization_id, status);
create index flow_initiatives_org_status_idx on public.flow_initiatives (organization_id, status, target_date);
create index flow_initiatives_project_idx on public.flow_initiatives (project_id, status);
create index flow_objectives_project_status_idx on public.flow_objectives (project_id, status, target_date);
create index flow_objectives_org_status_idx on public.flow_objectives (organization_id, status);
create index flow_goals_project_status_idx on public.flow_goals (project_id, status, target_date);
create index flow_goals_org_status_idx on public.flow_goals (organization_id, status);
create index flow_alignment_source_idx on public.flow_alignment_links (source_type, source_id);
create index flow_alignment_target_idx on public.flow_alignment_links (target_type, target_id);
create index flow_benefits_org_status_idx on public.flow_benefits (organization_id, status, target_date);
create index flow_milestones_project_due_idx on public.flow_milestones (project_id, status, due_on);
create index flow_tasks_project_status_idx on public.flow_tasks (project_id, status, due_date);
create index flow_tasks_project_stage_idx on public.flow_tasks (project_id, stage, priority);
create index flow_tasks_milestone_idx on public.flow_tasks (milestone_id, status);
create index flow_tasks_release_idx on public.flow_tasks (release_id, status);
create index flow_tasks_assignees_compat_idx on public.flow_tasks using gin (assignee_ids);
create index flow_tasks_labels_compat_idx on public.flow_tasks using gin (labels);
create index flow_tasks_search_idx on public.flow_tasks using gin (search_vector);
create index flow_task_assignees_user_idx on public.flow_task_assignees (user_id, project_id);
create index flow_task_dependencies_task_idx on public.flow_task_dependencies (project_id, task_id);
create index flow_task_dependencies_parent_idx on public.flow_task_dependencies (project_id, depends_on_task_id);
create index flow_task_comments_task_time_idx on public.flow_task_comments (task_id, created_at);
create index flow_task_reminders_pending_idx on public.flow_task_reminders (remind_at) where status = 'pending';
create index flow_task_activity_task_time_idx on public.flow_task_activity (task_id, created_at desc);
create index flow_issues_project_status_idx on public.flow_issues (project_id, status, severity, due_date);
create index flow_issues_assignee_idx on public.flow_issues (assignee_id, status);
create index flow_issues_signals_idx on public.flow_issues using gin (signals);
create index flow_issue_activity_issue_time_idx on public.flow_issue_activity (issue_id, created_at desc);
create index flow_work_queue_project_status_idx on public.flow_work_queue_items (project_id, status, priority desc, queue_position);
create index flow_calendar_events_project_range_idx on public.flow_calendar_events (project_id, starts_at, ends_at);
create index flow_time_entries_project_date_idx on public.flow_time_entries (project_id, entry_date desc);
create index flow_time_entries_user_date_idx on public.flow_time_entries (user_id, entry_date desc);
create index flow_approvals_project_status_idx on public.flow_approvals (project_id, status, due_at);
create index flow_approvals_subject_idx on public.flow_approvals (subject_type, subject_id);
create index flow_custom_fields_project_entity_idx on public.flow_custom_fields (project_id, entity_type, sort_order);
create index flow_custom_field_values_entity_idx on public.flow_custom_field_values (entity_type, entity_id);
create index flow_demand_requests_org_status_idx on public.flow_demand_requests (organization_id, status, priority);
create index flow_projections_project_type_idx on public.flow_projections (project_id, projection_type, status);
