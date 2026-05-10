# Nifty Reporting Gap Analysis

This notes what Geiger Flow is still missing compared with Nifty Project Management's reporting surface, using the provided screenshot and Nifty's public help documentation.

## Reference Features In Nifty

Sources:
- [Reporting in Nifty](https://help.niftypm.com/en/articles/4558252-reporting-in-nifty)
- [Time Tracking and Reporting](https://help.niftypm.com/en/articles/3059016-time-tracking-reporting)
- [Project Reports and Dashboards](https://help.niftypm.com/en/articles/11939408-project-reports-dashboards)
- [Managing Assignments with Workloads](https://help.niftypm.com/en/articles/3564514-managing-assignments-with-workloads)

Nifty's Reporting area combines several operational views:

- All Tasks: cross-project task reporting with project scope, filters, grouping, search, saved views, and task fields.
- Projects Overview: portfolio progress reporting with project and milestone rollups.
- Workloads: member workload distribution across projects and assignments.
- Members Report: teammate-centric open and completed task reporting over a date range.
- Timesheets: time entries filtered by projects, users, tags, and date range, with grouping and export.
- Check-Ins: lightweight team status reports and response rollups.
- Reporting Dashboards: configurable widgets and charts powered by task and custom field data.

## Implemented In Geiger Flow Now

- Added a Reporting screen to the home workspace sidebar.
- Added the same Reporting screen to project navigation for project-context access.
- Added report tabs for All Tasks, Projects Overview, Workloads, Members Report, Timesheets, and Check-Ins.
- Added a Nifty-style project selector panel.
- Added filter, search, group-by, saved-view, list, settings, and share controls.
- Added grouped task report sections for Overdue, Due Today, Due This Month, and Unscheduled.
- Added task columns for status, list, assignees, subscribers, due date, and tags.
- Added secondary report tables for the non-task report tabs.

## Remaining Product Gaps

- Real data: the current Reporting screen uses mock data. It needs to connect to project, task, member, time, and check-in data sources.
- Saved views: the Save view button is visual only. It needs persistence for filters, grouping, columns, scope, and tab selection.
- Advanced filters: Nifty supports filtering by project, assignees, due dates, tags, task fields, and project fields. Geiger Flow only has the shell controls.
- Column customization: Nifty allows choosing report fields. Geiger Flow needs column picker state and per-view column layouts.
- Exporting: Nifty exposes CSV, PDF, and print flows for completed tasks and timesheets. Geiger Flow needs export actions and report serializers.
- Timesheets: Geiger Flow needs real time-tracking entries, date range filters, grouping by project/date/tracker, and user-level time reports.
- Workload intelligence: Geiger Flow needs capacity, assignment load, member grouping, overload states, and completed-task export.
- Reporting dashboards: Nifty has widget-based reporting dashboards. Geiger Flow still needs chart/widget creation, custom field sources, and live dashboard layouts.
- Permission awareness: Nifty report visibility respects project and task access. Geiger Flow needs reporting queries to honor workspace, role, and project visibility.
- Check-ins: Geiger Flow needs check-in templates, schedules, responses, reminders, and reporting summaries.

## Suggested Next Milestones

1. Replace Reporting mock data with normalized task and project data.
2. Add saved views with filter, group, selected projects, and visible columns.
3. Build Timesheets data models and export flows.
4. Add workload capacity settings per member.
5. Add configurable report widgets for the dashboard-style reporting layer.
