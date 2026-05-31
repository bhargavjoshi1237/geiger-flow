create table if not exists public.flow_issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  external_key text,
  title text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  assignee_id uuid references auth.users(id) on delete set null,
  assignee_name text,
  reporter_id uuid references auth.users(id) on delete set null,
  reporter_name text,
  owner_team text,
  environment text,
  priority text,
  affected_users text,
  due_date date,
  case_summary text,
  impact text,
  reproduction_steps jsonb not null default '[]'::jsonb,
  signals jsonb not null default '[]'::jsonb,
  activity jsonb not null default '[]'::jsonb,
  source_refs text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.flow_issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.flow_issues(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flow_issues_project_status_idx on public.flow_issues (project_id, status, severity, due_date);
create index if not exists flow_issues_signals_idx on public.flow_issues using gin (signals);

alter table public.flow_issues enable row level security;
alter table public.flow_issue_comments enable row level security;

drop policy if exists flow_issues_project_all on public.flow_issues;
create policy flow_issues_project_all on public.flow_issues
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_issue_comments_project_all on public.flow_issue_comments;
create policy flow_issue_comments_project_all on public.flow_issue_comments
for all using (exists (select 1 from public.flow_issues issue where issue.id = issue_id and public.flow_is_project_member(issue.project_id)))
with check (exists (select 1 from public.flow_issues issue where issue.id = issue_id and public.flow_is_project_member(issue.project_id)));
