create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists ltree;
create extension if not exists btree_gist;
create extension if not exists pg_trgm;

create schema if not exists flow_private;

revoke all on schema flow_private from public;
revoke all on schema flow_private from anon;
revoke all on schema flow_private from authenticated;

create or replace function public.flow_slugify(value text)
returns text
language sql
immutable
strict
set search_path = public
as $$
  select trim(both '-' from lower(regexp_replace(value, '[^a-zA-Z0-9]+', '-', 'g')));
$$;

create or replace function public.flow_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.flow_sync_notification_timestamps()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.time is null and new.created_at is null then
    new.time = now();
    new.created_at = new.time;
  elsif new.time is null then
    new.time = new.created_at;
  elsif new.created_at is null then
    new.created_at = new.time;
  end if;
  return new;
end;
$$;
