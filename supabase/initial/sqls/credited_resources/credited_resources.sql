create table if not exists public.flow_credit_pools (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  name text not null,
  resource_type text not null,
  total_credits numeric(18,4) not null default 0,
  used_credits numeric(18,4) not null default 0,
  unit text not null default 'credits',
  renews_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_credit_allocations (
  id uuid primary key default gen_random_uuid(),
  credit_pool_id uuid not null references public.flow_credit_pools(id) on delete cascade,
  project_id uuid references public.flow_projects(id) on delete cascade,
  assignee_id uuid references auth.users(id) on delete set null,
  label text not null,
  amount numeric(18,4) not null,
  spent numeric(18,4) not null default 0,
  status text not null default 'active',
  rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_credit_usage_plan (
  id uuid primary key default gen_random_uuid(),
  credit_allocation_id uuid not null references public.flow_credit_allocations(id) on delete cascade,
  scheduled_for date not null,
  expected_amount numeric(18,4) not null,
  actual_amount numeric(18,4),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists flow_credit_pools_org_idx on public.flow_credit_pools (organization_id, resource_type);
create index if not exists flow_credit_allocations_project_idx on public.flow_credit_allocations (project_id, status);

alter table public.flow_credit_pools enable row level security;
alter table public.flow_credit_allocations enable row level security;
alter table public.flow_credit_usage_plan enable row level security;

drop policy if exists flow_credit_pools_org_select on public.flow_credit_pools;
create policy flow_credit_pools_org_select on public.flow_credit_pools
for select using (public.flow_is_org_member(organization_id));

drop policy if exists flow_credit_allocations_scope_select on public.flow_credit_allocations;
create policy flow_credit_allocations_scope_select on public.flow_credit_allocations
for select using (project_id is null or public.flow_is_project_member(project_id));

drop policy if exists flow_credit_usage_plan_scope_select on public.flow_credit_usage_plan;
create policy flow_credit_usage_plan_scope_select on public.flow_credit_usage_plan
for select using (exists (
  select 1
  from public.flow_credit_allocations allocation
  where allocation.id = credit_allocation_id
    and (allocation.project_id is null or public.flow_is_project_member(allocation.project_id))
));
