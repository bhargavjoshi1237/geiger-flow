# Geiger Flow Enterprise PM Feature Gap Research

Date: 2026-05-13  
Scope: features missing or only lightly represented in Geiger Flow that are expected in high-level project, portfolio, and work management products.

## Executive Summary

Geiger Flow already has a promising surface for lightweight creative project management: projects, issues, tasks, work queue, planning boards, projections, milestones, goals, objectives, reporting, assets, logs, team, vault, security, add-ons, forms, SQL, and project settings. The current codebase also shows useful future intent around dependencies, blockers, Git branches, agent sessions, reminders, roles, vault links, and status collection.

The biggest product gap is that Geiger Flow currently looks like a strong project workspace shell, while industry-level tools compete as operating systems for organizational execution. Enterprise buyers and PMOs expect strategy-to-execution alignment, portfolio governance, capacity planning, budget/financial control, scenario modeling, approvals, auditability, integrations, executive reporting, and AI that reduces status/reporting work.

The most repeated pain from users on the internet is not "we need another task board." It is:

- PMs spend too much time maintaining visibility instead of managing delivery.
- Leadership, finance, engineering, and teams each trust different systems.
- Dependencies, budgets, approvals, timelines, and executive reporting fragment across tools.
- Simple tools collapse at scale; enterprise tools become slow, expensive, and hard to adopt.
- AI is useful only when it has the whole work graph and can take governed action, not when it only writes summaries.

## Current Geiger Flow Footprint

Observed from the repository:

- Project navigation includes: Overview, Issues, Tasks, Work Queue, Grounding, Planning, Projections, Milestones, Goals, Reporting, Objectives, Assets, Logs, Team, Vault, Security, Settings.
- Settings include: General, Connectivity, Customs, Add-ons, Usage, Advanced, Enterprise.
- Add-ons exist for SQL, Project Plus, and Forms.
- Reporting was already analyzed against Nifty and still relies on mock/shell behavior in important places.
- Supabase schema currently only includes `flow_teams` and `flow_notifications`, so many screens appear UI-first or mock-data-first rather than backed by normalized enterprise data models.
- Tasks and milestones include rich mock fields such as status, priority, assignees, dates, dependencies, blockers, Git branch, reminders, agent session, vault reference, latest update, and visibility.

This means the recommended roadmap should not be "add tasks." It should turn the existing screens into a trusted execution system.

## Research Sources

Official product and market sources:

- Atlassian Jira features: goals, AI assignment, automations, dependency management, forms, reports, real-time updates, capacity, security, Marketplace integrations: https://www.atlassian.com/software/jira/core/features
- ClickUp dashboards: actionable dashboards, workload, time, shareable portals, AI answers, scheduled status reports: https://clickup.com/features/dashboards
- monday.com dashboards: 50+ widgets, high-level overview, resource management, workload, Gantt, time tracking: https://monday.com/features/dashboards
- Asana features: work tracking, portfolios, workload, goals/reporting AI, AI teammates: https://asana.com/features
- Asana AI teammate announcement: agents for workflows, insights analysis, project reporting: https://investors.asana.com/node/11441/pdf
- Smartsheet PPM: portfolio visibility, resource/budget tracking, AI insights, governance, intake, templates, risk, capacity: https://www.smartsheet.com/content/project-portfolio-management-software
- Smartsheet portfolio management: demand intake, templates, automated provisioning, change management, resource management, portfolio reporting, archiving: https://www.smartsheet.com/platform/portfolio-management
- Adobe Workfront: enterprise work intake, resourcing, tracking, proofing, approvals, reporting, AI workers, content supply chain: https://business.adobe.com/products/workfront.html
- Adobe Workfront product description: work management, reporting, asset review/approval/proofing, demand management, resource management, integrations: https://helpx.adobe.com/legal/product-descriptions/adobe-workfront.html
- Wrike features: ideate/align, plan/resource, execute, report/analyze, learn/adapt, integrate, safeguard, proofing, approvals: https://www.wrike.com/features
- Wrike enterprise: workflow automation, resource/capacity planning, reporting, admin/security, AI escalation: https://www.wrike.com/enterprise
- Planview: strategic portfolio management, capacity, risks, scenario modeling, AI analysis, value streams: https://www.planview.com/
- Planview Portfolios: strategic alignment, OKRs, investment prioritization, financial planning, demand management, capacity, scenarios, time reporting, cost actuals, AI dependency/risk intelligence: https://www.planview.com/products-solutions/products/planview-enterprise/
- ServiceNow SPM: demand management, governance, analytics, text-to-action, strategic alignment: https://www.servicenow.com/products/strategic-portfolio-management.html
- Aha Roadmaps: ideas, strategy, prioritization, releases, capacity, roadmaps: https://www.aha.io/roadmaps/overview/
- Aha prioritization: idea/feature scoring and ranking: https://www.aha.io/roadmaps/prioritization

People/user discussion signals:

- Reddit, projectmanagement, 2026 comparison: users call out dependency graphs, approvals, portfolio management, workload/capacity, advanced reporting, and multi-project governance as differentiators: https://www.reddit.com/r/projectmanagement/comments/1r7dr5i/project_management_tools_ranked_comparison_table/
- Reddit, projectmanagement, 2026 visibility complaint: PMs manually reconcile Jira, finance, Slack, resource tools, budgets, approvals, dependencies, and executive reporting: https://www.reddit.com/r/projectmanagement/comments/1tbxb17/does_anyone_else_feel_like_pms_spend_more_time/
- Reddit, ITManagers: leadership visibility into capacity, dependencies, and portfolio status needs manual work in light tools: https://www.reddit.com/r/ITManagers/comments/1kzvcgl/project_management_tools/
- Reddit, projectmanagement, tool selection: users want reporting, workload, dependencies, time, and less spreadsheet consolidation: https://www.reddit.com/r/projectmanagement/comments/1jwjw9s
- Reddit, projectmanagement, overlapping projects: users ask for real-time workload visibility, what-if scheduling, placeholder roles, built-in reporting, ITSM, scenario modeling, capacity/budget tradeoffs: https://www.reddit.com/r/projectmanagement/comments/1n7adzm/how_many_project_management_tools_did_you_try/
- Reddit, projectmanagement, big capital projects: users need WBS/P6 schedule links, contract processes, approvals, dependencies, resource visibility: https://www.reddit.com/r/projectmanagement/comments/1qobedw/anyone_found_pm_tools_that_actually_work_for_big/
- Reddit, projectmanagers, tool frustration: users want visibility across projects, dependencies, daily updates without heavy process: https://www.reddit.com/r/projectmanagers/comments/1t9y4oc/starting_to_feel_like_every_pm_tool_solves_one/
- Reddit, projectmanagers, PM tools mentioned: teams seek automated notifications and real-time visibility pushed into communication tools: https://www.reddit.com/r/projectmanagers/comments/1smd6o7/project_management_tools_most_mentioned_on_reddit/

## Priority Legend

- P0: Required to be credible as an enterprise PM product.
- P1: Strong competitive feature expected by mature organizations.
- P2: Differentiator or high-value niche feature.
- P3: Nice-to-have once foundations are stable.

## Missing Or Underdeveloped Features

| Priority | Feature | Organizational Problem Solved | Industry/User Evidence | Geiger Flow Gap | Suggested Product Shape |
|---|---|---|---|---|---|
| P0 | Real normalized project data model | UI shells cannot become a trusted source of truth without durable projects, tasks, milestones, risks, issues, dependencies, users, roles, updates, time, files, and audit data. | All enterprise products position themselves around live centralized work data. Smartsheet and Planview emphasize portfolio visibility from connected data. | Supabase schema is tiny; many screens use mock arrays. | Create core tables and APIs for projects, work items, milestones, objectives, dependencies, activities, comments, files, roles, events, and audit logs. |
| P0 | Portfolio management | Leaders need visibility across all projects, not one project at a time. | Smartsheet PPM, Planview, ServiceNow, Asana portfolios. Reddit users complain that dashboards tell different stories across tools. | Reporting exists, but portfolio-level project health, status rollups, and governance are not fully modeled. | Add portfolio objects, project grouping, portfolio dashboards, health rollups, priority/risk views, cross-project filters. |
| P0 | Strategic alignment from goals to execution | Organizations need to know which work supports company strategy and which work should stop. | Jira aligns work to goals; Planview connects strategy, OKRs, investments, roadmaps, financials; Asana has goals/reporting AI. | Goals/objectives exist, but strategy-to-task hierarchy appears shallow and not enforced. | Add Strategy -> Objective/OKR -> Initiative -> Project -> Milestone -> Task traceability with impact rollups. |
| P0 | Demand intake and request triage | Teams drown in ad hoc work from email, chat, meetings, and stakeholders. | Smartsheet Control Center and ServiceNow SPM emphasize demand management. Jira and Workfront support forms/intake. | Forms add-on exists, but no central demand queue, scoring, approval, conversion, or SLA. | Add intake portal, request types, triage queue, scoring, duplicate detection, approval path, conversion to project/task. |
| P0 | Resource and capacity management | Organizations need to know who is overloaded, who is available, and whether plans are realistic. | monday workload, Smartsheet resource management, Wrike resource/capacity, Planview capacity planning. Reddit repeatedly names workload/capacity as a missing layer. | Team and work queue exist, but no capacity calendars, allocation, skills, availability, utilization, or overload forecasting. | Add people capacity, role capacity, allocation heatmaps, planned vs actual load, holidays, part-time availability, skills matching. |
| P0 | Dependency graph and critical path | Cross-team projects fail when downstream effects of slips are hidden. | Jira dependency management, Planview intelligent dependency management, Reddit calls dependency chains essential. | Task mock data includes dependencies/blockers, but no persisted dependency graph, critical path, lag types, or impact simulation. | Add dependency map, blocked-by/blocking views, cycle detection, lag/lead time, critical path, impact of date changes. |
| P0 | Risk register and issue escalation | Leadership needs to see risks before they become missed deadlines. | Smartsheet, Planview, ServiceNow, Wrike emphasize risk, health, escalation. | Project Plus has risks, Issues screen exists, but no enterprise risk model across projects. | Add risk register with probability, impact, owner, mitigation, trigger, due date, escalation, risk heatmap, portfolio rollup. |
| P0 | Executive dashboards with live drill-down | Executives need simple high-level truth without PMs rebuilding slides. | ClickUp, monday, Smartsheet, Planview all sell dashboards; Reddit complains PMs manually reconcile reports. | Reporting screen exists but is mock/shell; dashboard widgets are not live or actionable. | Add configurable dashboards with KPI cards, charts, tables, saved filters, drill-down, share links, permissions. |
| P0 | Saved views and report subscriptions | Different stakeholders need repeatable views without manual setup every week. | ClickUp scheduled reports/agents, Nifty-style saved views, monday dashboards. | Nifty gap analysis notes saved views are visual only. | Save filters, grouping, columns, dashboard layouts, schedules, recipients, export format. |
| P0 | Time tracking and timesheets | Organizations need cost, billing, effort, utilization, and forecast accuracy. | ClickUp/monday dashboards include time tracking; Planview has time reporting; Workfront and Smartsheet resource planning rely on effort data. | Reporting has timesheet tab shell; no real time entries. | Add timer/manual time, approval, billable/non-billable, timesheet reminders, variance against estimates. |
| P0 | Budget, cost, and financial tracking | Finance often distrusts PM tools because budget and actuals live elsewhere. | Planview financial planning, forecast/actuals, costs; Smartsheet budget tracking; Reddit explicitly mentions finance using separate systems. | No visible financial model. | Add budget, forecast, actuals, cost rates, capital vs operating expense, burn, benefit, ROI, variance alerts. |
| P0 | Approval workflows | Work slows down when approvals are buried in comments or chat. | Workfront proofing/approvals, Wrike approvals, Smartsheet approvals, Reddit says approvals need to be explicit. | Tasks/comments exist, but no formal approval states, approver roles, or audit trail. | Add approval steps, required approvers, delegated approvals, due dates, reminders, audit history, approval gates. |
| P0 | Role-based access control and permission model | Enterprise users need secure project, field, file, report, and external access. | Jira mentions granular controls, SAML/SSO, data residency; Smartsheet controlled sharing; Wrike selective sharing. | Security and Enterprise screens exist, but likely not enforced end-to-end. | Add RBAC/ABAC, project roles, field-level restrictions, guest/client roles, report access, permission tests. |
| P0 | Audit logs and compliance evidence | Regulated organizations need to prove who changed what and when. | Jira, Wrike, Smartsheet, Planview all serve enterprise governance needs. User discussions mention audit trails for dates, budgets, critical tasks. | Logs screen uses mock logs. | Persist immutable event log for status/date/budget/permission/file changes with export and retention. |
| P0 | Enterprise authentication | Organizations require SSO, SCIM, MFA, domain claim, and session controls. | Jira official page lists SAML/SSO and enterprise security controls. Wrike enterprise includes corporate login. | Security UI has MFA/session/IP concepts but no full identity lifecycle. | Add SAML/OIDC SSO, SCIM provisioning, domain verification, MFA enforcement, session policies, IP allowlist. |
| P0 | Integrations marketplace and two-way sync | Teams already live in Slack, Teams, GitHub, Jira, Figma, Drive, email, calendars, finance tools. | Jira has 3000+ integrations; Workfront integrates with Adobe stack; ClickUp and monday emphasize connected dashboards. | Connectivity/add-ons exist, but no broad integration architecture or sync health model. | Build connector framework with OAuth, webhooks, field mapping, sync logs, conflict handling, per-project enablement. |
| P1 | Stakeholder/client portal | External stakeholders need progress without full workspace access. | ClickUp promotes shareable dashboards and client portals; Smartsheet controlled sharing. | No clear client portal separate from internal workspace. | Add read-only portal links, branded status pages, approvals, comments, file review, restricted dashboards. |
| P1 | Scenario and what-if planning | Leaders need to compare staffing, timing, scope, and budget tradeoffs before changing the live plan. | Planview scenario modeling; Reddit users mention portfolio-scale scenario modeling as a pain. | Projections screen exists, but no scenario clone/compare model. | Add sandbox scenarios, compare impact on dates/capacity/budget/risk, promote scenario to plan. |
| P1 | Work breakdown structure and program hierarchy | Complex organizations need programs, phases, workstreams, WBS, releases, and stage gates. | Planview program management; capital project users mention WBS/P6 and contract-driven processes. | Current hierarchy appears project-centric with goals/milestones/tasks. | Add program, phase, workstream, deliverable, stage gate, WBS code, release train support. |
| P1 | Custom fields and schemas per project type | PM systems must adapt to marketing, software, operations, HR, capital projects, and agencies. | Asana custom fields; Jira fields/workflows; Smartsheet templates and custom attributes; monday no-code customization. | Customs settings exist, but no durable schema system is evident. | Add field builder, typed fields, validation, required fields, formulas, per-template schema, reportable fields. |
| P1 | Workflow builder and automation rules | Manual status updates and reminders make PM tools feel like extra work. | Jira Rovo automations, Smartsheet workflows, Wrike automation, ClickUp automation and scheduled reports. | Add-ons and some UI controls exist, but no workflow engine. | Add trigger/action rules, conditions, escalations, SLA timers, natural-language rule creation later. |
| P1 | Project templates and governed provisioning | PMOs need consistent setup across teams without manual recreation. | Smartsheet Control Center templates/provisioning; Jira templates; Wrike spaces. | Flow.json mentions project templates, but implementation is unclear. | Add template library, required sections, default workflows, fields, roles, reports, automated project creation. |
| P1 | Status update collection and check-ins | PMs waste time asking for updates; teams forget to report. | Nifty check-ins, ClickUp AI status reports, Reddit asks for automated notifications and visibility. | Flow.json mentions status check; reporting gap notes check-ins missing. | Add scheduled check-ins, async prompts, non-response tracking, team summaries, confidence/sentiment. |
| P1 | Delivery confidence and health scoring | Raw status is not enough; leaders need confidence and early warning. | Smartsheet AI insights/risk flags; Planview AI sentiment and risk; Jira AI risk identification. | Mock task has deadline tracking, but no predictive health model. | Add health score from schedule variance, blocked time, capacity, unresolved risks, update recency, sentiment. |
| P1 | Advanced calendar and timeline/Gantt | Organizations need dates, dependencies, milestones, workloads, and releases in a scheduling view. | monday Gantt, Jira timeline, Smartsheet Gantt/timeline, user requests for Gantt plus dependencies and lags. | Projections and planning exist, but no robust Gantt scheduling engine. | Add Gantt with baselines, dependency types, lag, milestones, critical path, date change impact. |
| P1 | Baselines and variance tracking | PMOs need to know how the plan changed, not only the current plan. | Planview forecast/actuals and portfolio analytics; enterprise PM practice expects baselines. | No plan baseline model. | Capture baseline dates, cost, scope, capacity; show variance and change reasons. |
| P1 | Change request management | Scope changes need formal evaluation before they silently change delivery. | Smartsheet change management; enterprise tools often include demand/change workflows. | No formal change-control flow. | Add change requests with impact assessment, approvals, affected tasks, budget/date changes, audit trail. |
| P1 | Benefits realization and outcome tracking | Organizations fund projects for outcomes, not just task completion. | Planview emphasizes outcomes, value streams, benefits, OKRs; ServiceNow SPM aligns investments to impact. | Goals exist, but no realized benefits tracking. | Add expected benefits, owner, metric source, target, realized value, post-completion review. |
| P1 | Prioritization and scoring | Teams need transparent decisions about what to do next. | Aha idea/feature prioritization, Planview investment prioritization, Smartsheet request scoring. | Tasks have priority, but no scoring framework. | Add configurable scoring by impact, effort, risk, confidence, revenue, customer value, strategic alignment. |
| P1 | AI project assistant with governed actions | AI must reduce PM admin and act within permission boundaries. | Jira Rovo, ClickUp Brain/Super Agents, Asana AI teammates, Workfront AI workers, Planview AI agents. | Task mock has assistPanel and agent session fields, but no productized AI workflow. | Add AI assistant that answers from project graph, drafts updates, detects risks, creates tasks, follows approval rules, logs actions. |
| P1 | Natural-language query over project data | Leaders want answers without building custom reports. | ClickUp Brain answers dashboard questions; Planview conversational AI queries portfolio data. | No query assistant. | Add "ask Geiger" over projects, tasks, risks, time, capacity, budget, assets with citations to records. |
| P1 | Meeting-to-work capture | Organizational work starts in meetings and gets lost. | User discussions emphasize Slack/email/manual reconciliation; AI work platforms are moving toward automatic capture. | Grounding exists, but no meeting capture pipeline. | Add meeting notes ingestion, action extraction, owner/date suggestions, decision log, follow-up reminders. |
| P1 | Slack/Teams/email status sync | Teams update where they work; PM tools fail when they require duplicate entry. | Jira tracks work from Slack/Figma/Gmail; Reddit demands updates pushed into communication platforms. | Connectivity exists, but no specific collaboration sync. | Add Slack/Teams/email connectors for task creation, status prompts, reminders, approvals, digest delivery. |
| P1 | Mobile-first update flows | Enterprise adoption depends on quick updates from the field, client calls, and travel. | monday and Smartsheet market accessibility across workflows; user reviews praise tools with easy updates. | No dedicated mobile/PWA workflow mentioned. | Add responsive quick-update, offline draft, push notifications, mobile approvals, QR/link task updates. |
| P1 | Search across work graph | Users need to find decisions, assets, tasks, blockers, risks, and people. | Enterprise platforms converge docs, tasks, dashboards, and integrations. | Search appears per-screen. | Add global search with filters, entity types, recent activity, permissions, saved searches. |
| P1 | Knowledge base and decision records | Organizations lose context when decisions live in chat and meetings. | ClickUp combines docs, tasks, chat, whiteboards; Aha and Planview link strategy to execution artifacts. | Planning/Notes exists, but not a structured decision/knowledge layer. | Add decision records, project wiki, lessons learned, retrospective notes, linked decisions to tasks and risks. |
| P1 | Document/proofing review | Creative and marketing organizations need visual review, markup, approval, and versioning. | Adobe Workfront and Wrike both emphasize proofing and approvals. | Assets exists, but proofing workflow is unclear. | Add file versioning, visual comments, compare versions, review rounds, approval gates, brand compliance checklist. |
| P1 | Asset lifecycle and usage analytics | Creative orgs need to know where assets are used and whether they are approved/expired. | Workfront integrates with content supply chain; Geiger DAM is part of product vision. | Assets and DAM cards exist, but lifecycle governance is likely thin. | Add asset status, rights/expiry, usage tracking, linked campaigns/projects, CDN delivery, approval state. |
| P1 | Issue, risk, decision, dependency linking | Work context needs relationships, not isolated lists. | Planview connected work graph; Jira issue links; Reddit users complain about fragmented context. | Tasks have dependency fields; not a universal graph. | Add typed relationships across all entities: blocks, caused by, mitigates, approves, funds, uses asset, decided by. |
| P1 | Notification governance and personal inbox | Notification overload kills adoption; missing alerts kill delivery. | Reddit mentions automated notifications and visibility; tools compete on digests and reminders. | Inbox exists and notifications table exists, but rule/governance model is narrow. | Add user notification preferences, digest rules, escalation rules, snooze, action inbox, mention/tasks/approval separation. |
| P1 | Workload-aware assignment | Assigning work should consider availability, skills, role, time zone, and current load. | Jira says AI assigns to right person; Smartsheet and Wrike emphasize resource fit; Aha uses capacity for realistic roadmaps. | Tasks have assignees, but no assignment intelligence. | Add recommendations based on capacity, skills, past ownership, time zone, project role, conflict warnings. |
| P1 | Skills and role inventory | Organizations need to staff work by capability, not only named people. | Smartsheet mentions skills and availability; Reddit asks for placeholder roles until people are identified. | Team screen exists, but no skills/role capacity model. | Add skill tags, proficiency, role demand, placeholder resources, hiring gap reports. |
| P1 | Cross-methodology support | Enterprises mix agile, waterfall, operations, and creative workflows. | Smartsheet supports agile/waterfall/hybrid; Planview supports hybrid work delivery. | Geiger Flow leans creative/lightweight, with kanban/planning screens. | Add methodology templates: Kanban, Scrum, Waterfall, Stage-gate, Campaign, Client delivery, Operations. |
| P1 | Agile delivery metrics | Software teams expect sprint, velocity, burndown, cycle time, throughput, lead time. | Jira reporting includes cycle time/burndown/capacity; Planview value stream management. | Issues/tasks exist, but no mature agile reporting. | Add sprint/cycle entities, velocity, burnup/down, cumulative flow, lead/cycle time, WIP aging. |
| P1 | Forecasting and predictive schedule risk | Organizations need early prediction, not late reporting. | Smartsheet AI insights, Planview AI risk, Jira AI risk identification. | No forecast model beyond mock health labels. | Add forecast completion date, confidence interval, risk drivers, data quality warnings. |
| P1 | Import/export and migration tools | Buyers need to leave spreadsheets/Jira/Asana/Monday or export for audit and leadership. | User discussions mention spreadsheet consolidation and portable reports. | SQL add-on exists, but not guided PM import/export. | Add CSV/XLSX import, Jira/Asana/Trello import, PDF/CSV exports, Power BI/Looker connectors. |
| P1 | API and webhooks | Enterprise PM tools must integrate with internal systems. | Jira mentions powerful APIs; Planview and ServiceNow serve enterprise integration use cases. | Add-on registry exists, but public API/webhook story is unclear. | Add REST/GraphQL API, webhooks, service accounts, scoped tokens, event subscriptions. |
| P1 | Data quality and stale update detection | Reports are useless when updates are stale or inconsistent. | Reddit complains leadership does not trust reporting layers. | No data quality score. | Add stale status detection, missing owner/date warnings, conflicting fields, update freshness score. |
| P1 | Governance center / PMO console | PMOs need standardization without blocking teams. | Smartsheet Control Center and ServiceNow SPM emphasize governance. | Enterprise settings exists as placeholder category. | Add PMO console for templates, fields, workflows, reports, permissions, compliance policies. |
| P2 | Multi-portfolio funding and investment planning | Large orgs allocate budgets across portfolios, products, programs, and initiatives. | Planview investment prioritization, financial planning, product/program funding. | No funding model. | Add investment objects, funding cycles, budget scenarios, priority tradeoffs, funded/unfunded demand. |
| P2 | Contract and vendor management | Capital, agency, and enterprise programs depend on vendor obligations and approvals. | Reddit capital-project users mention contracts and site/vendor coordination. | No vendor/contract model. | Add vendors, contracts, obligations, deliverables, approval evidence, invoice linkage. |
| P2 | Procurement and external dependency tracking | Projects slip because purchases, legal, security, and vendors move outside PM tools. | Reddit IT/capital examples mention purchasing, receiving, provisioning, contractors, HVAC, security. | Dependencies are task-only in mock data. | Add external dependency records, owner org, expected date, SLA, escalation, linked purchase/order. |
| P2 | ITSM and operational issue bridge | IT teams need project work linked to incidents, problems, changes, and service requests. | Reddit asks for ITSM features with PM. ServiceNow combines SPM with enterprise workflows. | Issues screen is project issue-focused. | Add ITSM-style issue types or integrations with ServiceNow/Jira Service Management. |
| P2 | Risk-adjusted prioritization | Projects with high reward and high delivery risk need balanced decisions. | Planview, ServiceNow, Smartsheet all position around confident decisions under constraints. | Priority is simple. | Add scoring that combines strategic value, cost, capacity, risk exposure, deadline criticality. |
| P2 | Sentiment and confidence capture | Teams often know a project is in trouble before metrics show it. | Planview markets AI sentiment analysis on status updates. | No team confidence field. | Add confidence check-ins, sentiment trend, anonymous risk pulse, PM notes. |
| P2 | Organizational network / expertise finder | Cross-functional work needs finding who knows a topic. | Asana AI materials mention asking who knows about a topic. | Team exists, no expertise graph. | Add expertise tags, ownership history, related documents/tasks, "who knows this?" search. |
| P2 | AI redlines for plans | PMs need a second set of eyes on unrealistic dates, missing owners, dependency gaps. | Planview and Jira AI risk/dependency positioning; users complain real projects are messy. | No plan review assistant. | Add AI plan checker for missing dates, overloaded people, orphan tasks, late approvals, impossible dependencies. |
| P2 | Auto-generated status narratives with evidence | Leadership wants concise updates; PMs need them grounded in actual work. | ClickUp Super Agents send scheduled reports; Jira AI status updates; Asana insights analyst. | Reporting is not yet live. | Generate weekly/monthly status with links to changed tasks, risks, blockers, budget/capacity movement. |
| P2 | Portfolio health command center | PMOs need one view of all red/yellow/green projects and why. | Smartsheet portfolio dashboards, Planview portfolio analytics. | Overview/reporting not portfolio-command-grade. | Add heatmaps by portfolio, team, department, risk type, budget variance, schedule variance. |
| P2 | Work graph analytics | Organizations need to see bottlenecks and hidden coordination costs. | Planview connected work graph and AI dependency management. | Planning graph exists visually, but not analytics-driven. | Add graph metrics: bottleneck owners, dependency fan-in/out, blocker duration, cross-team handoff latency. |
| P2 | Adoption analytics | PM tools fail when teams do not update them. PMOs need usage visibility without micromanagement. | Planview has adoption support; user complaints mention tools needing a dedicated admin. | Usage screen exists but likely generic. | Add adoption health: active users, stale projects, update compliance, template usage, workflow friction. |
| P2 | Client billing and profitability | Agencies and services teams need project profitability, not just delivery status. | Smartsheet professional services examples include billable/non-billable and delivery status. | No billing beyond product subscription screen. | Add bill rates, invoices/export, margin, retainer burn, client budget alerts. |
| P2 | SLA and service-level tracking | Internal ops and client teams need promises measured. | ServiceNow/work management use cases; automation products track alerts/escalations. | No SLA model. | Add SLAs for requests, approvals, incidents, tasks, milestones with breach alerts. |
| P2 | Project closeout and lessons learned | Organizations repeat mistakes when closeout knowledge is not captured. | Smartsheet mentions learn/optimize/scale; Wrike has learn/adapt. | No structured closeout. | Add closeout checklist, retrospective, lessons, final budget/date variance, reusable improvements. |
| P2 | Archive and historical analytics | Compliance and trend analysis require frozen historical projects. | Smartsheet Control Center includes project archiving for trend analysis and compliance. | No archive model. | Add project archive, read-only snapshots, retention rules, historical portfolio reports. |
| P2 | Data residency and retention controls | Enterprise/regulatory buyers care where data lives and how long it is kept. | Jira mentions data residency/compliance; enterprise tools sell governance. | No visible data residency/retention model. | Add retention policies, export/delete controls, region metadata, legal hold. |
| P2 | Field-level security for sensitive data | Budgets, compensation, security items, and vendor details need restricted fields. | Enterprise permission expectations; user discussions mention locking budget/critical fields. | Vault/security exist, but field-level restrictions not visible. | Add per-field visibility/edit rules, masked fields, permission-aware exports/reports. |
| P2 | Data lineage for reports | Stakeholders need to know where dashboard numbers come from. | Trust in reporting is a repeated user pain. | No lineage. | Add drill-down from KPI to source records, query definition, last refreshed, owner. |
| P2 | Workspace operating model | Large orgs need departments, business units, teams, portfolios, and clients. | Enterprise tools sell multi-department execution. | Team table stores members jsonb; no rich org model. | Add org units, teams, roles, locations, clients, departments, reporting lines. |
| P2 | AI governance and audit | AI that changes work needs accountability, permissions, and cost controls. | 2026 AI trend coverage emphasizes responsible AI, trust, red-teaming, cost, and governance. | No AI governance visible. | Add AI action log, approval rules, source citations, model policy, cost tracking, opt-out/sensitive fields. |
| P2 | Local/agent integration layer | Geiger's roadmap mentions Copilot Cloud, Cursor, Claude Code, VS Code, local sessions. | AI agent trend is strong; Asana, Jira, ClickUp, Workfront, Planview all add agentic workflows. | Flow.json mentions agent integrations, task mock has agentSession, but not implemented deeply. | Add agent session registry, task handoff protocol, agent logs, approval checkpoints, branch/PR linking. |
| P2 | Git/DevOps delivery bridge | Software teams need task status tied to branches, PRs, commits, builds, releases. | Jira integrates deeply with dev workflows; user discussions mention Bitbucket integration. | Task mock has gitBranch and issues fields. | Add GitHub/GitLab/Bitbucket connectors, PR status, deployment status, code ownership, release notes. |
| P2 | Release management | Product/software teams need release readiness, go/no-go, deployment calendar, dependencies. | Jira release management; Aha release planning. | Milestones/projections exist, but no release object. | Add releases, environments, gates, readiness checklist, dependencies, release notes. |
| P2 | Idea management | Product and innovation teams need to collect, score, and promote ideas. | Aha ideas/prioritization; Planview demand from unstructured ideas to formal requests. | Forms could collect ideas, but no idea lifecycle. | Add idea portal, voting, scorecards, merge duplicates, promote to roadmap/project. |
| P2 | Roadmap communication views | Different audiences need different roadmap levels. | Aha roadmaps; Jira and Planview roadmaps. | Projections/planning exist, but not stakeholder-grade roadmap publishing. | Add now/next/later, timeline, swimlanes, release roadmap, portfolio roadmap, shareable views. |
| P2 | Advanced notifications into communication channels | Stakeholders need updates where they work without manually checking PM tool. | Reddit says visibility should be pushed to Slack/Teams; Jira tracks from Slack/Gmail. | Notifications/inbox exist internally. | Add Slack/Teams/email digests, project channels, escalation routes, update-to-channel rules. |
| P2 | External reporting packs | Executives often still need PDF/PowerPoint/Excel. | User discussions mention portable PDFs/BI reports and leadership PowerPoints. | Nifty gap notes exports missing. | Add branded PDF, PPTX export, Excel/CSV, scheduled board packs, snapshot links. |
| P3 | In-app onboarding and role-based guidance | Enterprise tools need adoption support for different roles. | Planview Adopt and common user complaints about complexity. | No onboarding/guidance layer. | Add guided setup, role-specific tours, empty states, PMO playbooks, template recommendations. |
| P3 | Performance guardrails for large workspaces | ClickUp complaints show feature-rich tools lose trust when slow. | User reviews frequently complain about lag in large PM workspaces. | Unknown performance posture. | Add pagination, virtualized tables, query budgets, dashboard caching, data-size warnings. |
| P3 | Accessibility and localization readiness | Enterprise deployments include global teams and compliance expectations. | Mature SaaS buyers expect accessibility/global support. | Unknown. | Add WCAG checks, keyboard flows, time zone handling, locale/date/currency support. |
| P3 | No-code apps/work apps | Departments want tailored surfaces without full custom development. | Smartsheet role-based work apps; monday Work OS style customization. | Add-ons exist, but user-level no-code app composition is unclear. | Add app builder for project views, forms, dashboards, automations, role-specific pages. |

## Features Often Missing In PM Tools But Organizations Still Demand

These are especially interesting for Geiger Flow because they can become differentiators rather than table-stakes clones.

### 1. Trusted Reporting Layer Across Fragmented Systems

Problem: Engineering works in Jira/GitHub, finance in spreadsheets/ERP, leadership in slides, teams in Slack/Teams, and PMs manually reconcile everything.

Opportunity: Geiger Flow can become a "truth reconciliation layer" that imports signals from multiple systems, shows data lineage, and lets each dashboard explain where numbers came from.

Required pieces:

- Integrations and sync logs.
- Field mapping and conflict resolution.
- Report data lineage.
- Data quality score.
- Dashboard comments and sign-off.

### 2. Dependency Intelligence Beyond Manual Links

Problem: Most tools let users link tasks, but organizations still miss hidden dependencies across teams, approvals, vendors, budgets, assets, and releases.

Opportunity: Build a connected work graph that infers possible dependencies from shared milestones, files, owners, release dates, PRs, approvals, and comments.

Required pieces:

- Universal relationship graph.
- Suggested hidden blockers.
- Critical path with external dependencies.
- Impact simulation when a task slips.
- Dependency owner and SLA.

### 3. PM Admin Reduction, Not More PM UI

Problem: Users repeatedly complain that PM tools become a second job. Adding more fields can make reporting worse if teams do not update them.

Opportunity: Design Geiger Flow around "minimum update burden." Every PM feature should answer: can this be inferred, requested automatically, or updated where the user already works?

Required pieces:

- Async check-ins.
- Slack/Teams/email update capture.
- AI status summaries grounded in changes.
- Stale field detection.
- One-click update prompts.

### 4. Scenario Planning For Humans

Problem: Many tools support static plans, but organizations need to ask: what if we move this launch, lose two engineers, reduce budget, or add a regulatory project?

Opportunity: Make scenario modeling approachable rather than enterprise-heavy.

Required pieces:

- Clone plan into scenario.
- Adjust capacity/scope/dates.
- Compare timeline, cost, risk, and benefits.
- Promote selected scenario to live plan with change record.

### 5. Decision Memory

Problem: Organizations lose why decisions were made. Later teams reopen settled debates or cannot explain scope/date changes.

Opportunity: Decision records can be first-class objects linked to tasks, risks, approvals, strategy, and assets.

Required pieces:

- Decision log.
- Decision owner, date, context, alternatives, outcome.
- Links to meeting notes, comments, approvals.
- "Changed because of decision X" audit trail.

### 6. Role/Skill-Based Planning With Placeholder People

Problem: Teams plan work before exact staffing is known. Most PM tools assign to user accounts, which breaks early capacity planning.

Opportunity: Let PMs plan against roles and skills, then convert placeholders to people later.

Required pieces:

- Placeholder resources.
- Skill demand forecast.
- Hiring/staffing gap report.
- Role capacity and named-person capacity.

### 7. Finance-Trusted PM Data

Problem: Finance often refuses to trust PM tools for budget and actuals, creating parallel systems.

Opportunity: Add finance-grade controls: locked fields, approvals, variance, audit trail, source lineage, export.

Required pieces:

- Budget and forecast baselines.
- Actuals import from finance tools.
- Field-level permissions.
- Change approval for budget/date moves.
- Cost capitalization support for software teams.

### 8. Governed AI Project Worker

Problem: AI summaries are easy to copy. Organizations demand AI that can act, but safely.

Opportunity: Geiger Flow can ship AI workers with explicit permission, scope, audit, and citations.

Required pieces:

- AI action approval policies.
- AI action log.
- Source-cited answers.
- Restricted field awareness.
- Cost and model usage tracking.
- Human accountability handoff.

### 9. Project Health Based On Behavior, Not Self-Reported Color

Problem: Green/yellow/red status is often political and late.

Opportunity: Compute health from actual signals: blocked duration, stale updates, open approvals, capacity overload, dependency drift, budget variance, missed check-ins, team confidence.

Required pieces:

- Signal-based health model.
- Explainable risk drivers.
- Manual override with reason.
- Historical accuracy tracking.

### 10. Adoption Health

Problem: Tools fail when only the PM updates them. Organizations rarely see adoption decay until reports stop being trusted.

Opportunity: Give admins a non-punitive adoption health view.

Required pieces:

- Update freshness by project/team.
- View/report usage.
- Automation failure rates.
- Stale projects.
- Teams needing onboarding.

## Recommended Roadmap

### Phase 1: Make The Core Trustworthy

Goal: turn Geiger Flow from UI-rich shell into a reliable project system.

1. Core normalized data model and APIs.
2. Real tasks, milestones, issues, goals, objectives, dependencies, comments, activities.
3. RBAC and audit logs.
4. Saved views and live reporting.
5. Import/export basics.
6. Notification preferences and action inbox.

### Phase 2: Enterprise PM Baseline

Goal: meet baseline expectations of mature organizations.

1. Portfolio management.
2. Resource and capacity planning.
3. Time tracking and timesheets.
4. Risk register and escalation.
5. Budget/forecast/actuals.
6. Approval workflows.
7. Templates and governed project provisioning.
8. Dashboard builder and subscriptions.

### Phase 3: Differentiated Intelligence

Goal: solve the pains that users say current PM tools still fail at.

1. Dependency intelligence and work graph.
2. Scenario planning.
3. AI project assistant with governed actions.
4. Status collection and automatic evidence-based reports.
5. Data quality and trusted reporting layer.
6. Decision memory and lessons learned.
7. Skill/role-based planning with placeholder resources.

### Phase 4: Ecosystem And Scale

Goal: become a real organizational execution platform.

1. Slack, Teams, email, calendar, GitHub/GitLab/Jira/Figma/Drive integrations.
2. API, webhooks, service accounts.
3. SSO, SCIM, domain verification, retention, data residency controls.
4. Client/stakeholder portals.
5. Mobile quick-update flows.
6. Performance work for large workspaces.

## Highest-Impact Feature Ideas For Geiger Flow

If only ten features are chosen first, prioritize these:

1. Core data model replacing mock project/task/report data.
2. Portfolio dashboard with live project health.
3. Resource/capacity management with overload warnings.
4. Dependency graph with critical path and impact simulation.
5. Risk register with mitigation and escalation.
6. Executive reporting dashboards with saved views and subscriptions.
7. Intake/request management with scoring and approvals.
8. Time and budget tracking with forecast vs actuals.
9. Slack/Teams/email update capture and async check-ins.
10. AI status/risk assistant that cites source records and logs actions.

## Product Positioning Recommendation

Geiger Flow should avoid becoming "another PM board with dark UI." The stronger position is:

> A project execution system for creative, product, and technical organizations that connects planning, assets, dependencies, agents, and delivery intelligence in one trusted work graph.

That positioning fits what is already in the repo: planning boards, assets/DAM direction, vault/security, agent-session hints, Git branch hints, objectives/goals, reporting, and add-ons.

The biggest opportunity is to combine creative project management with enterprise-grade execution truth: dependencies, approvals, assets, decisions, capacity, reporting, and AI agents.

## Notes On Evidence Strength

- Strongest evidence: official feature sets from Jira, Smartsheet, Planview, Workfront, Wrike, monday, ClickUp, Asana, Aha, ServiceNow.
- Strongest user pain signals: Reddit threads about visibility maintenance, capacity, dependencies, executive reporting, spreadsheet/manual reconciliation, and tool complexity.
- Local confidence: high that Geiger Flow has UI coverage for many concepts, but low that those concepts are backed by enterprise-grade data and workflows, because current schema and several screens show mock/static data.

