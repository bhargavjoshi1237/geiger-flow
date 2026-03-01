create table public.flow_teams (
  id uuid not null default gen_random_uuid (),
  members jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint flow_teams_pkey primary key (id)
) TABLESPACE pg_default;