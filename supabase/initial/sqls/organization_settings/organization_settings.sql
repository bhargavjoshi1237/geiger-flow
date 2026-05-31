create table if not exists public.flow_org_privacy_settings (
  organization_id uuid primary key references public.flow_organizations(id) on delete cascade,
  telemetry_level text not null default 'minimal',
  share_database_info boolean not null default false,
  share_usage_data boolean not null default true,
  retention_days integer not null default 365,
  settings jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.flow_org_privacy_settings enable row level security;

drop policy if exists flow_org_privacy_settings_org_all on public.flow_org_privacy_settings;
create policy flow_org_privacy_settings_org_all on public.flow_org_privacy_settings
for all using (public.flow_is_org_member(organization_id)) with check (public.flow_is_org_member(organization_id));
