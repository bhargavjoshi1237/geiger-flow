-- Issues: forward-compatible expansion column.
-- Every product table carries a `metadata jsonb` bag so new, not-yet-promoted
-- attributes can be stored without a schema change (see MODULE_CONVENTIONS.md).
-- For issues this currently holds: type, estimate, startDate.
--
-- Depends on 0001_issues.sql (flow.issues). Idempotent.

create schema if not exists flow;

alter table flow.issues
  add column if not exists metadata jsonb not null default '{}'::jsonb;
