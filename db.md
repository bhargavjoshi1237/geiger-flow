## Table `base`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` |  |
| `viewport` | `text` |  Nullable |
| `nodes` | `text` |  Nullable |
| `edges` | `text` |  Nullable |
| `id` | `uuid` | Primary |
| `preference` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `collab`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `host` | `uuid` |  Nullable |
| `code` | `text` |  Nullable |
| `state_nodes` | `text` |  Nullable |
| `state_edges` | `text` |  Nullable |
| `preference` | `jsonb` |  Nullable |
| `id` | `uuid` | Primary |
| `joiners` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |
| `rollback` | `jsonb` |  Nullable |

## Table `boards`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `description` | `text` |  Nullable |
| `nodes` | `text` |  Nullable |
| `edges` | `text` |  Nullable |
| `viewport` | `text` |  Nullable |
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `user_id` | `uuid` |  Nullable |

## Table `documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `content` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `canvas_boards`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `project_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  |
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `description` | `text` |  |
| `elements` | `jsonb` |  |
| `app_state` | `jsonb` |  |
| `files` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `dash_changelog`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `version` | `text` |  |
| `title` | `text` |  |
| `description` | `text` |  |
| `category` | `text` |  |
| `product` | `text` |  |
| `id` | `uuid` | Primary |
| `release_date` | `timestamptz` |  |
| `is_featured` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `image_url` | `text` |  Nullable |

## Table `dash_changelog_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `changelog_id` | `uuid` |  |
| `type` | `text` |  |
| `description` | `text` |  |
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |

## Table `dash_blog_posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `excerpt` | `text` |  |
| `content` | `text` |  |
| `author_id` | `uuid` |  Nullable |
| `author_name` | `text` |  |
| `author_avatar` | `text` |  Nullable |
| `category` | `text` |  |
| `featured_image` | `text` |  Nullable |
| `published_at` | `timestamptz` |  Nullable |
| `id` | `uuid` | Primary |
| `tags` | `_text` |  Nullable |
| `is_published` | `bool` |  |
| `is_featured` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `reading_time_minutes` | `int4` |  Nullable |
| `views` | `int4` |  Nullable |

## Table `dash_blog_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `name` | `text` |  Unique |
| `slug` | `text` |  Unique |
| `description` | `text` |  Nullable |
| `id` | `uuid` | Primary |
| `color` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `docs_nav_groups`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `id` | `uuid` | Primary |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `docs_pages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `description` | `text` |  |
| `toc` | `jsonb` |  |
| `status` | `text` |  |
| `sort_order` | `int4` |  |
| `has_children` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `nav_group_id` | `uuid` |  |
| `slug` | `text` |  Unique |
| `title` | `text` |  |
| `nav_label` | `text` |  Nullable |
| `preview` | `text` |  Nullable |
| `published_at` | `timestamptz` |  Nullable |

## Table `docs_content_blocks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `page_id` | `uuid` |  |
| `anchor_id` | `text` |  |
| `eyebrow` | `text` |  Nullable |
| `title` | `text` |  |
| `id` | `uuid` | Primary |
| `block_type` | `text` |  |
| `body` | `jsonb` |  |
| `cards` | `jsonb` |  |
| `features` | `jsonb` |  |
| `links` | `jsonb` |  |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `office_files`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `project_id` | `text` |  Nullable |
| `user_id` | `uuid` |  |
| `type` | `text` |  |
| `thumbnail` | `text` |  Nullable |
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `content` | `jsonb` |  |
| `starred` | `bool` |  |
| `trashed` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `visibility` | `text` |  |
| `link_role` | `text` |  |
| `folder_id` | `uuid` |  Nullable |

## Table `office_file_shares`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `file_id` | `uuid` |  |
| `email` | `text` |  |
| `user_id` | `uuid` |  Nullable |
| `id` | `uuid` | Primary |
| `role` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `office_folders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` |  |
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `color` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `_prisma_migrations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `checksum` | `varchar` |  |
| `finished_at` | `timestamptz` |  Nullable |
| `migration_name` | `varchar` |  |
| `logs` | `text` |  Nullable |
| `rolled_back_at` | `timestamptz` |  Nullable |
| `started_at` | `timestamptz` |  |
| `applied_steps_count` | `int4` |  |

## Table `organizations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `name` | `text` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `owner` | `uuid` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `country` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  Nullable |
| `description` | `text` |  |
| `slug` | `text` |  Nullable |
| `deleted_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  |

## Table `organization_users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user` | `uuid` |  Nullable |
| `organization` | `uuid` |  Nullable |
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `role` | `Role` |  Nullable |

## Table `plan`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `organisation` | `uuid` |  Nullable |
| `plan` | `jsonb` |  Nullable |

## Table `projects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `flow_project_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |
| `dam_project_id` | `uuid` |  Nullable |
| `notes_project_id` | `uuid` |  Nullable |
| `grey_project_id` | `uuid` |  Nullable |
| `office_project_id` | `uuid` |  Nullable |
| `forms_project_id` | `uuid` |  Nullable |
| `events_project_id` | `uuid` |  Nullable |
| `content_project_id` | `uuid` |  Nullable |
| `pods_project_id` | `uuid` |  Nullable |
| `comms_project_id` | `uuid` |  Nullable |
| `chat_project_id` | `uuid` |  Nullable |
| `canvas_project_id` | `uuid` |  Nullable |
| `docs_project_id` | `uuid` |  Nullable |
| `id` | `uuid` | Primary |
| `name` | `text` |  Nullable |
| `slug` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `provider` | `text` |  Nullable |
| `region` | `text` |  Nullable |
| `tags` | `_text` |  |
| `logo_url` | `text` |  Nullable |
| `metadata` | `jsonb` |  |
| `visibility` | `text` |  |
| `organization_id` | `uuid` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `deleted_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  |

## Table `organization_project`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `project` | `uuid` |  Nullable |
| `organisition` | `uuid` |  Nullable |
| `plan` | `uuid` |  Nullable |

## Table `flow_issues`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `project_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `due_date` | `date` |  Nullable |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `id` | `uuid` | Primary |
| `status` | `text` |  |
| `priority` | `text` |  |
| `labels` | `_text` |  |
| `assignee_ids` | `_uuid` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `flow_issue_comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `issue_id` | `uuid` |  |
| `author_id` | `uuid` |  Nullable |
| `body` | `text` |  |
| `id` | `uuid` | Primary |
| `attachments` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `flow_notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `icon` | `text` |  Nullable |
| `icon_color` | `text` |  Nullable |
| `bg_color` | `text` |  Nullable |
| `id` | `uuid` | Primary |
| `type` | `text` |  |
| `extra` | `jsonb` |  |
| `read` | `bool` |  |
| `time` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |

## Table `flow_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `role` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `id` | `uuid` | Primary |
| `organization_id` | `uuid` |  Nullable |
| `display_name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `position` | `text` |  Nullable |

## Table `flow_workspace_roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `organization_id` | `uuid` |  |
| `role_key` | `text` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `id` | `uuid` | Primary |
| `permissions` | `jsonb` |  |
| `is_system` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `flow_teams`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `organization_id` | `uuid` |  Nullable |
| `project_id` | `uuid` |  Nullable |
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `members` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `flow_forms`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `project_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `published_at` | `timestamptz` |  Nullable |
| `id` | `uuid` | Primary |
| `status` | `text` |  |
| `schema` | `jsonb` |  |
| `settings` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `flow_tasks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `project_id` | `uuid` |  |
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `parent_link` | `text` |  Nullable |
| `start_date` | `date` |  Nullable |
| `due_date` | `date` |  Nullable |
| `git_branch` | `text` |  Nullable |
| `latest_update` | `text` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `completed_by` | `uuid` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |
| `deleted_at` | `timestamptz` |  Nullable |
| `status` | `text` |  |
| `priority` | `text` |  |
| `stage` | `text` |  |
| `type` | `text` |  |
| `progress` | `numeric` |  Nullable |
| `labels` | `_text` |  |
| `assignee_ids` | `_uuid` |  |
| `deadline_tracking` | `text` |  Nullable |
| `reminders` | `jsonb` |  |
| `role_visibility` | `text` |  |
| `custom_fields` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

