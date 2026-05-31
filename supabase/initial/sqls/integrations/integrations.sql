create table if not exists public.flow_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  provider text not null,
  name text not null,
  status text not null default 'available',
  config jsonb not null default '{}'::jsonb,
  scopes text[] not null default array[]::text[],
  connected_by uuid references auth.users(id) on delete set null,
  connected_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists flow_integrations_org_provider_idx on public.flow_integrations (organization_id, provider, status);

alter table public.flow_integrations enable row level security;

drop policy if exists flow_integrations_org_select on public.flow_integrations;
create policy flow_integrations_org_select on public.flow_integrations
for select using (public.flow_is_org_member(organization_id));
