# Geiger Flow Database

This directory is the canonical fresh-install database package for Geiger Flow.

The older SQL under `supabase/initial/sqls` and `supabase/sqls` remains available as historical implementation material. It contains 60 unique table definitions, but it is not a complete ordered baseline: several tables are duplicated, many UI workflows have no durable model, some relationships are stored as arrays or JSON, and application-facing row-level security is inconsistent.

The target baseline contains 183 unique Flow-owned application tables across seven ordered SQL modules. Product-specific records owned by sibling Geiger applications are linked through `project_id` instead of being duplicated in Flow.

## Install Order

Run these files in order against a Supabase PostgreSQL database:

1. `00_foundation.sql`
2. `10_identity_portfolio.sql`
3. `20_strategy_work.sql`
4. `30_collaboration_content.sql`
5. `40_resources_finance.sql`
6. `50_integrations_governance.sql`
7. `60_security_rls.sql`

Use a database owner or migration role. The final module enables row-level security, creates policies, installs lifecycle triggers, and seeds the add-on and billing-plan catalogs.

## Design Rules

- Application tables remain in `public` with the existing `flow_` prefix for frontend compatibility.
- Sensitive connector and vault material is represented by opaque secret references. Raw credentials do not belong in PostgreSQL.
- High-volume and independently queried project records carry `project_id` even when it can be derived from a parent. Small dependent records inherit access through their parent to avoid redundant tenant keys.
- Flexible configuration belongs in `jsonb`; durable business relationships use foreign keys and junction tables.
- Monetary values use `numeric`, never PostgreSQL `money`.
- Soft deletion is used for user-facing records where recovery or audit history matters.
- Append-only events are used for audit, usage, synchronization, delivery, and operational history.
- Status columns use constrained text values so future migrations can extend them without PostgreSQL enum replacement work.

## Compatibility

The schema keeps the names and fields currently referenced by the application, including:

- `flow_profiles.organization_id` and `flow_profiles.role`
- `flow_projects` provider, region, status, tags, budget, and metadata fields
- `flow_teams.members`
- `flow_notifications.time`, icon, color, and extra fields
- Workspace role keys and permission arrays

New code should prefer normalized membership, assignment, permission, question, answer, and relationship tables.

## Deployment Notes

- Storage buckets and bucket policies are platform resources and should be provisioned separately for profile images, assets, Office files, planning uploads, form attachments, and exports.
- Geiger Office owns `office_folders`, `office_files`, and `office_file_shares`. Its project-link migration adds foreign keys to `flow_projects`; Flow must query those tables rather than defining `flow_office_*` copies.
- Geiger Forms owns `geiger_forms`, `geiger_form_responses`, `geiger_form_versions`, and `geiger_form_comments`. Its project-link migration adds nullable `project_id` and `created_by` to `geiger_forms`; Flow must query those tables rather than defining `flow_forms` copies.
- See `EXTERNAL_PRODUCT_TABLES.md` for the audited ownership and reuse plan across sibling Geiger applications.
- Billing payment instruments, OAuth tokens, API secrets, SSH material, and vault secrets must be stored with the selected payment provider or secrets manager. Database rows store provider identifiers, fingerprints, and secret references only.
- `execute_sql` is intentionally not created by this package. An unrestricted SQL RPC exposed to browser clients would bypass the application security model. SQL Explorer should use a separately secured server-side execution service with statement classification, scoped credentials, timeouts, row limits, and immutable query auditing.
- Existing installations need a reviewed migration from the legacy schema. These files define the target baseline and should not be applied blindly over a populated production database.
