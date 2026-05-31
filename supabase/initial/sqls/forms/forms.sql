create table if not exists public.flow_forms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft',
  schema jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.flow_form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.flow_forms(id) on delete cascade,
  project_id uuid not null references public.flow_projects(id) on delete cascade,
  respondent_id uuid references auth.users(id) on delete set null,
  respondent_email citext,
  response jsonb not null default '{}'::jsonb,
  files jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text
);

create index if not exists flow_forms_project_status_idx on public.flow_forms (project_id, status);
create index if not exists flow_form_responses_form_idx on public.flow_form_responses (form_id, submitted_at desc);
create index if not exists flow_form_responses_response_idx on public.flow_form_responses using gin (response);

alter table public.flow_forms enable row level security;
alter table public.flow_form_responses enable row level security;

drop policy if exists flow_forms_project_all on public.flow_forms;
create policy flow_forms_project_all on public.flow_forms
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));

drop policy if exists flow_form_responses_project_all on public.flow_form_responses;
create policy flow_form_responses_project_all on public.flow_form_responses
for all using (public.flow_is_project_member(project_id)) with check (public.flow_is_project_member(project_id));
