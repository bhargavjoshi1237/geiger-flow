-- Flow notifications deleted_at
--
-- Adds soft delete to public.flow_notifications so the Inbox archives rows
-- (deleted_at) instead of hard-deleting them. Self-contained and idempotent.

-- @up
alter table public.flow_notifications
  add column if not exists deleted_at timestamptz;

create index if not exists flow_notifications_user_live_idx
  on public.flow_notifications (user_id, time desc)
  where deleted_at is null;

-- @down
drop index if exists public.flow_notifications_user_live_idx;

alter table public.flow_notifications
  drop column if exists deleted_at;
