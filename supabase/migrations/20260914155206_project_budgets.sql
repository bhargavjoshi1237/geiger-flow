-- Project budgets
--
-- Owns flow.project_budgets: one row per project holding the monthly budget
-- plus the manual and architecture expense lists behind the project budget
-- context. Expense entries are plain jsonb arrays; per-expense indexing is
-- not needed, so no child table.

-- @up
create extension if not exists pgcrypto;

create schema if not exists flow;
grant usage on schema flow to anon, authenticated, service_role;

-- Shared "touch updated_at" trigger function (suite convention). Defined here
-- so this migration never depends on another having run first.
create or replace function flow.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists flow.project_budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  monthly_budget numeric not null default 42000,
  manual_expenses jsonb not null default '[]'::jsonb,
  architecture_expenses jsonb not null default '[]'::jsonb,
  -- Expansion bag: keep not-yet-promoted config here, promote to a real column
  -- once it needs indexing, constraints or its own RLS.
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

grant all on flow.project_budgets to anon, authenticated, service_role;

create index if not exists project_budgets_project_idx
  on flow.project_budgets (project_id)
  where deleted_at is null;

drop trigger if exists project_budgets_touch_updated_at on flow.project_budgets;
create trigger project_budgets_touch_updated_at
before update on flow.project_budgets
for each row execute function flow.touch_updated_at();

-- Demo-open RLS (the dashboard runs unauthenticated). Tighten once auth lands.
alter table flow.project_budgets enable row level security;

drop policy if exists project_budgets_demo_all on flow.project_budgets;
create policy project_budgets_demo_all on flow.project_budgets
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- @down
drop table if exists flow.project_budgets cascade;
