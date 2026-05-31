create table if not exists public.flow_billing_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flow_organizations(id) on delete cascade,
  plan text not null default 'basic',
  seats integer not null default 1,
  currency char(3) not null default 'USD',
  billing_email citext,
  payment_customer_ref text,
  subscription_ref text,
  status text not null default 'active',
  trial_ends_at timestamptz,
  renews_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_invoices (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references public.flow_billing_accounts(id) on delete cascade,
  invoice_number text not null,
  amount numeric(14,2) not null,
  currency char(3) not null default 'USD',
  status text not null default 'open',
  issued_on date not null,
  due_on date,
  paid_at timestamptz,
  line_items jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  unique (billing_account_id, invoice_number)
);

alter table public.flow_billing_accounts enable row level security;
alter table public.flow_invoices enable row level security;

drop policy if exists flow_billing_accounts_org_select on public.flow_billing_accounts;
create policy flow_billing_accounts_org_select on public.flow_billing_accounts
for select using (public.flow_is_org_member(organization_id));

drop policy if exists flow_invoices_org_select on public.flow_invoices;
create policy flow_invoices_org_select on public.flow_invoices
for select using (exists (select 1 from public.flow_billing_accounts account where account.id = billing_account_id and public.flow_is_org_member(account.organization_id)));
