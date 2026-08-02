-- Imported from 0006_tasks_metadata.sql by geiger-orm.
-- No @down section — this migration cannot be rolled back.

-- @up
-- Tasks: forward-compatible expansion column.
-- Every product table carries a `metadata jsonb` bag so new, not-yet-promoted
-- attributes can be stored without a schema change (see MODULE_CONVENTIONS.md).
--
-- Depends on 0002_tasks.sql (flow.tasks). Idempotent.

create schema if not exists flow;

alter table flow.tasks
  add column if not exists metadata jsonb not null default '{}'::jsonb;
