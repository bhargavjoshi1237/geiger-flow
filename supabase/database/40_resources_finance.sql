create table public.flow_skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  name citext not null,
  category text,
  description text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (id, organization_id)
);

create table public.flow_member_skills (
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.flow_skills(id) on delete cascade,
  proficiency smallint not null default 1 check (proficiency between 1 and 5),
  years_experience numeric(5,2) check (years_experience is null or years_experience >= 0),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  primary key (user_id, skill_id),
  foreign key (skill_id, organization_id) references public.flow_skills(id, organization_id) on delete cascade
);

create table public.flow_resource_calendars (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  timezone text not null default 'UTC',
  weekly_capacity_hours numeric(6,2) not null default 40 check (weekly_capacity_hours between 0 and 168),
  working_pattern jsonb not null default '{}'::jsonb check (jsonb_typeof(working_pattern) = 'object'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, user_id, name),
  unique (id, organization_id)
);

create table public.flow_resource_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  calendar_id uuid not null references public.flow_resource_calendars(id) on delete cascade,
  availability_range daterange not null,
  capacity_hours numeric(8,2) not null check (capacity_hours >= 0),
  availability_percent numeric(5,2) not null default 100 check (availability_percent between 0 and 100),
  reason text,
  created_at timestamptz not null default now(),
  foreign key (calendar_id, organization_id) references public.flow_resource_calendars(id, organization_id) on delete cascade
);

create table public.flow_time_off (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  leave_type text not null,
  leave_range daterange not null,
  status text not null default 'approved' check (status in ('requested', 'approved', 'rejected', 'cancelled')),
  hours numeric(8,2) check (hours is null or hours >= 0),
  note text,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_resource_allocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  project_member_id uuid references public.flow_project_members(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  task_id uuid references public.flow_tasks(id) on delete cascade,
  workstream_id uuid references public.flow_workstreams(id) on delete set null,
  resource_type text not null default 'person' check (resource_type in ('person', 'role', 'team', 'vendor', 'asset')),
  resource_name text,
  allocation_range daterange not null,
  allocation_percent numeric(5,2) not null default 100 check (allocation_percent between 0 and 100),
  hourly_rate numeric(14,2) check (hourly_rate is null or hourly_rate >= 0),
  capacity_hours numeric(8,2) check (capacity_hours is null or capacity_hours >= 0),
  status text not null default 'allocated' check (status in ('planned', 'allocated', 'available', 'at_risk', 'completed', 'cancelled')),
  access_level text,
  utilization jsonb not null default '{}'::jsonb check (jsonb_typeof(utilization) = 'object'),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (project_member_id is not null or user_id is not null or resource_name is not null),
  unique (id, project_id)
);

create table public.flow_resource_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  request_type text not null check (request_type in ('person', 'role', 'position', 'hiring', 'vendor', 'asset')),
  title text not null,
  description text,
  status text not null default 'review' check (status in ('draft', 'review', 'approved', 'open', 'sourcing', 'fulfilled', 'rejected', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  requested_by uuid references auth.users(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  skill_requirements jsonb not null default '[]'::jsonb check (jsonb_typeof(skill_requirements) = 'array'),
  requested_range daterange,
  requested_capacity_hours numeric(8,2) check (requested_capacity_hours is null or requested_capacity_hours >= 0),
  target_cost numeric(18,2) check (target_cost is null or target_cost >= 0),
  currency char(3) not null default 'USD',
  due_on date,
  fulfilled_allocation_id uuid references public.flow_resource_allocations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_credit_pools (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  name text not null,
  resource_type text not null,
  unit text not null,
  total_quantity numeric(24,6) not null check (total_quantity >= 0),
  allocated_quantity numeric(24,6) not null default 0 check (allocated_quantity >= 0),
  used_quantity numeric(24,6) not null default 0 check (used_quantity >= 0),
  period_start timestamptz not null,
  period_end timestamptz not null,
  reset_policy jsonb not null default '{}'::jsonb check (jsonb_typeof(reset_policy) = 'object'),
  status text not null default 'active' check (status in ('draft', 'active', 'exhausted', 'expired', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end > period_start),
  check (allocated_quantity <= total_quantity),
  unique (organization_id, resource_type, period_start),
  unique (id, organization_id)
);

create table public.flow_credit_allocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  credit_pool_id uuid not null references public.flow_credit_pools(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  target_type text not null check (target_type in ('User', 'Task', 'Goal', 'Milestone', 'Module', 'Project', 'Team')),
  target_id uuid,
  target_label text not null,
  quantity numeric(24,6) not null check (quantity > 0),
  used_quantity numeric(24,6) not null default 0 check (used_quantity >= 0),
  status text not null default 'draft' check (status in ('draft', 'on_track', 'watch', 'exhausted', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at),
  check (used_quantity <= quantity),
  foreign key (credit_pool_id, organization_id) references public.flow_credit_pools(id, organization_id) on delete cascade,
  unique (id, organization_id)
);

create table public.flow_credit_usage_plan (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  credit_allocation_id uuid not null references public.flow_credit_allocations(id) on delete cascade,
  plan_date date not null,
  planned_quantity numeric(24,6) not null default 0 check (planned_quantity >= 0),
  actual_quantity numeric(24,6) not null default 0 check (actual_quantity >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (credit_allocation_id, organization_id) references public.flow_credit_allocations(id, organization_id) on delete cascade,
  unique (credit_allocation_id, plan_date)
);

create table public.flow_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  credit_pool_id uuid not null references public.flow_credit_pools(id) on delete cascade,
  allocation_id uuid references public.flow_credit_allocations(id) on delete set null,
  transaction_type text not null check (transaction_type in ('grant', 'allocate', 'consume', 'refund', 'expire', 'adjust')),
  quantity numeric(24,6) not null,
  source_type text,
  source_id uuid,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now(),
  foreign key (credit_pool_id, organization_id) references public.flow_credit_pools(id, organization_id) on delete cascade
);

create table public.flow_vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('prospect', 'active', 'suspended', 'inactive')),
  contact_name text,
  contact_email citext,
  tax_id text,
  payment_terms text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (id, organization_id)
);

create table public.flow_vendor_contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  vendor_id uuid not null references public.flow_vendors(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'expired', 'terminated', 'renewal')),
  starts_on date,
  ends_on date,
  committed_amount numeric(18,2) check (committed_amount is null or committed_amount >= 0),
  currency char(3) not null default 'USD',
  storage_bucket text,
  storage_path text,
  auto_renew boolean not null default false,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  foreign key (vendor_id, organization_id) references public.flow_vendors(id, organization_id) on delete cascade
);

create table public.flow_budgets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  program_id uuid references public.flow_programs(id) on delete cascade,
  portfolio_id uuid references public.flow_portfolios(id) on delete cascade,
  name text not null,
  budget_type text not null default 'project' check (budget_type in ('project', 'program', 'portfolio', 'department', 'initiative')),
  fiscal_year integer,
  period_start date not null,
  period_end date not null,
  currency char(3) not null default 'USD',
  approved_amount numeric(18,2) not null default 0 check (approved_amount >= 0),
  contingency_amount numeric(18,2) not null default 0 check (contingency_amount >= 0),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'locked', 'closed')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  check (num_nonnulls(project_id, program_id, portfolio_id) <= 1),
  unique (id, project_id),
  unique (id, organization_id)
);

create table public.flow_budget_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  budget_id uuid not null references public.flow_budgets(id) on delete cascade,
  parent_id uuid references public.flow_budget_lines(id) on delete cascade,
  category text not null,
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  vendor_id uuid references public.flow_vendors(id) on delete set null,
  source_type text not null default 'manual' check (source_type in ('manual', 'architecture', 'resource', 'contract', 'integration')),
  source_id uuid,
  capex_opex text check (capex_opex is null or capex_opex in ('capex', 'opex')),
  planned_amount numeric(18,2) not null default 0 check (planned_amount >= 0),
  committed_amount numeric(18,2) not null default 0 check (committed_amount >= 0),
  forecast_amount numeric(18,2) not null default 0 check (forecast_amount >= 0),
  actual_amount numeric(18,2) not null default 0 check (actual_amount >= 0),
  status text not null default 'on_track' check (status in ('on_track', 'watch', 'over', 'closed')),
  notes text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (budget_id, organization_id) references public.flow_budgets(id, organization_id) on delete cascade
);

create table public.flow_financial_actuals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  budget_line_id uuid references public.flow_budget_lines(id) on delete set null,
  vendor_id uuid references public.flow_vendors(id) on delete set null,
  transaction_date date not null,
  amount numeric(18,2) not null,
  currency char(3) not null default 'USD',
  reference text,
  description text,
  source text not null default 'manual',
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table public.flow_financial_forecasts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  budget_line_id uuid references public.flow_budget_lines(id) on delete cascade,
  forecast_date date not null,
  amount numeric(18,2) not null,
  confidence numeric(5,2) check (confidence is null or confidence between 0 and 100),
  scenario text not null default 'base',
  assumptions jsonb not null default '{}'::jsonb check (jsonb_typeof(assumptions) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, project_id, budget_line_id, forecast_date, scenario)
);

create table public.flow_billing_plans (
  id uuid primary key default gen_random_uuid(),
  plan_key text not null unique,
  name text not null,
  status text not null default 'active' check (status in ('draft', 'active', 'retired')),
  currency char(3) not null default 'USD',
  price_per_seat numeric(14,2) not null default 0 check (price_per_seat >= 0),
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  included_units jsonb not null default '{}'::jsonb check (jsonb_typeof(included_units) = 'object'),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  provider_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flow_billing_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.flow_organizations(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  billing_email citext,
  company_name text,
  tax_id text,
  currency char(3) not null default 'USD',
  spend_cap numeric(18,2) check (spend_cap is null or spend_cap >= 0),
  status text not null default 'active' check (status in ('active', 'past_due', 'suspended', 'closed')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_customer_id),
  unique (id, organization_id)
);

create table public.flow_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  billing_account_id uuid not null references public.flow_billing_accounts(id) on delete cascade,
  plan_id uuid not null references public.flow_billing_plans(id) on delete restrict,
  provider_subscription_id text,
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired')),
  seat_quantity integer not null default 1 check (seat_quantity > 0),
  period_start timestamptz not null,
  period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end > period_start),
  foreign key (billing_account_id, organization_id) references public.flow_billing_accounts(id, organization_id) on delete cascade,
  unique (provider_subscription_id)
);

create table public.flow_payment_methods (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references public.flow_billing_accounts(id) on delete cascade,
  provider_payment_method_id text not null unique,
  method_type text not null,
  brand text,
  last4 char(4),
  exp_month smallint check (exp_month is null or exp_month between 1 and 12),
  exp_year integer,
  is_default boolean not null default false,
  status text not null default 'active' check (status in ('active', 'expired', 'detached')),
  created_at timestamptz not null default now()
);

create table public.flow_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  billing_account_id uuid not null references public.flow_billing_accounts(id) on delete cascade,
  subscription_id uuid references public.flow_subscriptions(id) on delete set null,
  provider_invoice_id text,
  invoice_number text,
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  currency char(3) not null default 'USD',
  subtotal numeric(18,2) not null default 0,
  tax numeric(18,2) not null default 0,
  total numeric(18,2) not null default 0,
  amount_paid numeric(18,2) not null default 0,
  amount_due numeric(18,2) not null default 0,
  period_start timestamptz,
  period_end timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  hosted_url text,
  pdf_url text,
  created_at timestamptz not null default now(),
  foreign key (billing_account_id, organization_id) references public.flow_billing_accounts(id, organization_id) on delete cascade,
  unique (provider_invoice_id),
  unique (organization_id, invoice_number),
  unique (id, organization_id)
);

create table public.flow_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.flow_invoices(id) on delete cascade,
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  description text not null,
  quantity numeric(18,6) not null default 1,
  unit_amount numeric(18,6) not null default 0,
  amount numeric(18,2) not null default 0,
  period_start timestamptz,
  period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  foreign key (invoice_id, organization_id) references public.flow_invoices(id, organization_id) on delete cascade
);

create table public.flow_usage_limits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  metric text not null,
  unit text not null,
  soft_limit numeric(24,6) check (soft_limit is null or soft_limit >= 0),
  hard_limit numeric(24,6) check (hard_limit is null or hard_limit >= 0),
  reset_interval text not null default 'monthly' check (reset_interval in ('never', 'daily', 'weekly', 'monthly', 'yearly')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (hard_limit is null or soft_limit is null or hard_limit >= soft_limit),
  unique nulls not distinct (organization_id, project_id, metric)
);

create table public.flow_usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  metric text not null,
  quantity numeric(24,6) not null default 1,
  unit text not null default 'count',
  dimensions jsonb not null default '{}'::jsonb check (jsonb_typeof(dimensions) = 'object'),
  idempotency_key text,
  recorded_at timestamptz not null default now()
);

create table public.flow_usage_rollups_daily (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  metric text not null,
  usage_date date not null,
  quantity numeric(30,6) not null default 0,
  unit text not null,
  dimensions jsonb not null default '{}'::jsonb check (jsonb_typeof(dimensions) = 'object'),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, project_id, metric, usage_date, dimensions)
);

create table public.flow_org_privacy_settings (
  organization_id uuid primary key references public.flow_organizations(id) on delete cascade,
  assistant_opt_in text not null default 'disabled' check (assistant_opt_in in ('disabled', 'schema', 'schema_logs', 'schema_logs_data')),
  data_processing_region text,
  telemetry_enabled boolean not null default true,
  product_analytics_enabled boolean not null default true,
  third_party_ai_enabled boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index flow_member_skills_org_idx on public.flow_member_skills (organization_id, skill_id);
create index flow_resource_calendars_user_idx on public.flow_resource_calendars (user_id, is_default);
create index flow_resource_availability_range_idx on public.flow_resource_availability using gist (availability_range);
create index flow_time_off_user_range_idx on public.flow_time_off using gist (user_id, leave_range);
create index flow_resource_allocations_project_range_idx on public.flow_resource_allocations using gist (project_id, allocation_range);
create index flow_resource_allocations_user_range_idx on public.flow_resource_allocations using gist (user_id, allocation_range);
create index flow_resource_requests_project_status_idx on public.flow_resource_requests (project_id, status, priority);
create index flow_credit_pools_org_idx on public.flow_credit_pools (organization_id, resource_type, status);
create index flow_credit_allocations_project_idx on public.flow_credit_allocations (project_id, status);
create unique index flow_credit_transactions_idempotency_idx
  on public.flow_credit_transactions (organization_id, idempotency_key)
  where idempotency_key is not null;
create unique index flow_financial_actuals_idempotency_idx
  on public.flow_financial_actuals (organization_id, source, idempotency_key)
  where idempotency_key is not null;
create unique index flow_subscriptions_current_org_idx
  on public.flow_subscriptions (organization_id)
  where status in ('trialing', 'active', 'past_due', 'paused');
create unique index flow_usage_events_idempotency_idx
  on public.flow_usage_events (organization_id, metric, idempotency_key)
  where idempotency_key is not null;
create index flow_credit_transactions_pool_time_idx on public.flow_credit_transactions (credit_pool_id, occurred_at desc);
create index flow_vendor_contracts_project_idx on public.flow_vendor_contracts (project_id, status, ends_on);
create index flow_budgets_project_idx on public.flow_budgets (project_id, status, period_start);
create index flow_budget_lines_budget_status_idx on public.flow_budget_lines (budget_id, status, category);
create index flow_budget_lines_source_idx on public.flow_budget_lines (source_type, source_id);
create index flow_financial_actuals_project_date_idx on public.flow_financial_actuals (project_id, transaction_date desc);
create index flow_financial_forecasts_project_date_idx on public.flow_financial_forecasts (project_id, forecast_date);
create index flow_subscriptions_org_status_idx on public.flow_subscriptions (organization_id, status, period_end);
create unique index flow_payment_methods_default_idx on public.flow_payment_methods (billing_account_id) where is_default = true and status = 'active';
create index flow_invoices_org_status_idx on public.flow_invoices (organization_id, status, created_at desc);
create index flow_usage_events_org_metric_idx on public.flow_usage_events (organization_id, metric, recorded_at desc);
create index flow_usage_events_project_metric_idx on public.flow_usage_events (project_id, metric, recorded_at desc);
