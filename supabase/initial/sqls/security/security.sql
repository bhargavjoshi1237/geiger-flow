create table if not exists public.flow_audit_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.flow_projects(id) on delete cascade,
  organization_id uuid references public.flow_organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  subject_type text,
  subject_id uuid,
  ip_address inet,
  network cidr,
  user_agent text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.flow_security_settings (
  project_id uuid primary key references public.flow_projects(id) on delete cascade,
  read_only boolean not null default false,
  maintenance_mode boolean not null default false,
  audit_logging boolean not null default true,
  rate_limiting boolean not null default true,
  ip_restriction boolean not null default false,
  request_signing boolean not null default true,
  allowed_networks cidr[] not null default array[]::cidr[],
  signing_keys jsonb not null default '[]'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists flow_audit_events_project_time_idx on public.flow_audit_events (project_id, created_at desc);

alter table public.flow_audit_events enable row level security;
alter table public.flow_security_settings enable row level security;

drop policy if exists flow_audit_events_project_select on public.flow_audit_events;
create policy flow_audit_events_project_select on public.flow_audit_events
for select using ((project_id is not null and public.flow_is_project_member(project_id)) or (organization_id is not null and public.flow_is_org_member(organization_id)));

drop policy if exists flow_security_settings_project_all on public.flow_security_settings;
create policy flow_security_settings_project_all on public.flow_security_settings
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
