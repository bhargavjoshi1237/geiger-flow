// Fixture check for the landing playground: `npm run demo:verify`.
//
// The playground swaps in a fixture-backed Supabase client, so a fixture that is
// missing a column the data layer filters on doesn't fail loudly — the screen
// just renders its empty state, and the demo looks broken with no error. This
// replays the exact query shapes from features/*/actions.js, then asserts every
// cross-reference between fixtures resolves, so a gap fails here instead.
//
// Add a query here as each new screen's fixtures land.

import { createDemoClient } from "./demo-client.js";
import { setDemoWriteHandler } from "./demo-mode.js";
import { fixtures, DEMO_PROJECT } from "./fixtures.js";

const sb = createDemoClient();
const flow = sb.schema("flow");
const pid = DEMO_PROJECT.id;
const failures = [];
let checks = 0;

function report(name, ok, detail = "") {
  checks += 1;
  if (!ok) failures.push(name);
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

function rows(name, result, { expect = 1 } = {}) {
  const data = result?.data;
  const ok = Array.isArray(data) && data.length >= expect;
  report(name, ok, `${data?.length ?? "null"} row(s)`);
}

// --- Reads, in the shapes features/*/actions.js issues them -------------------

const projectScoped = (table) =>
  flow.from(table).select("*").eq("project_id", pid).is("deleted_at", null);

for (const table of [
  "issues",
  "tasks",
  "goals",
  "objectives",
  "milestones",
  "assets",
  "resource_allocations",
  "external_links",
]) {
  rows(`list ${table}`, await projectScoped(table));
}

rows(
  "list activity_logs",
  await flow
    .from("activity_logs")
    .select("*")
    .eq("project_id", pid)
    .order("created_at", { ascending: false })
    .limit(50),
);

rows("list project_members", await flow.from("project_members").select("*").eq("project_id", pid));

rows("project row", await sb.from("projects").select("*").eq("id", pid).is("deleted_at", null));

rows(
  "list org members",
  await sb.from("flow_profiles").select("*").eq("organization_id", DEMO_PROJECT.organization_id),
);

rows(
  "unread notifications",
  await sb
    .from("flow_notifications")
    .select("*")
    .eq("user_id", fixtures["flow.project_members"][0].user_id)
    .eq("read", false),
);

// Comments are read per entity, not per project — take the target from the
// comment row itself so this can't drift from the data.
const [firstComment] = fixtures["flow.issue_comments"];
rows(
  "list issue_comments",
  await flow
    .from("issue_comments")
    .select("*")
    .eq("issue_id", firstComment.issue_id)
    .order("created_at", { ascending: true }),
);
const [firstTaskComment] = fixtures["flow.task_comments"];
rows(
  "list task_comments",
  await flow
    .from("task_comments")
    .select("*")
    .eq("task_id", firstTaskComment.task_id)
    .order("created_at", { ascending: true }),
);

// The reads that would throw rather than return empty.
const single = await sb.from("projects").select("*").eq("id", pid).maybeSingle();
report("maybeSingle project", Boolean(single.data));

const peak = await flow
  .from("issues")
  .select("number")
  .eq("project_id", pid)
  .order("number", { ascending: false })
  .limit(1)
  .maybeSingle();
report("highest issue number", Boolean(peak.data), `number ${peak.data?.number}`);

// --- Referential integrity --------------------------------------------------

const idsFor = (table) => new Set(fixtures[table].map((row) => row.id));

const memberIds = new Set(fixtures["flow.project_members"].map((row) => row.user_id));
for (const table of ["flow.issues", "flow.tasks"]) {
  const dangling = fixtures[table]
    .flatMap((row) => row.assignee_ids ?? [])
    .filter((id) => !memberIds.has(id));
  report(`${table}.assignee_ids resolve`, dangling.length === 0, `${dangling.length} dangling`);
}

for (const [table, column, pool] of [
  ["flow.goals", "objective_id", idsFor("flow.objectives")],
  ["flow.issues", "parent_id", idsFor("flow.issues")],
  ["flow.tasks", "parent_link", idsFor("flow.goals")],
  ["flow.issue_comments", "issue_id", idsFor("flow.issues")],
  ["flow.task_comments", "task_id", idsFor("flow.tasks")],
]) {
  const dangling = fixtures[table].filter((row) => row[column] && !pool.has(row[column]));
  report(`${table}.${column} resolve`, dangling.length === 0, `${dangling.length} dangling`);
}

const numbers = fixtures["flow.issues"].map((row) => row.number);
report("issue numbers unique", new Set(numbers).size === numbers.length);

for (const table of Object.keys(fixtures)) {
  const orphan = fixtures[table].filter((row) => "project_id" in row && row.project_id !== pid);
  if (orphan.length > 0) report(`${table} single-project`, false, `${orphan.length} other project`);
}

// --- Read-only enforcement --------------------------------------------------

let toasts = 0;
setDemoWriteHandler(() => {
  toasts += 1;
});

const storage = sb.storage.from("homeboard");
const writes = [
  ["insert", await flow.from("issues").insert({}).select().single()],
  ["update", await flow.from("issues").update({}).eq("id", "x").select().single()],
  ["delete", await flow.from("issues").delete().eq("id", "x")],
  ["upsert", await flow.from("goals").upsert({})],
  ["rpc", await flow.rpc("next_issue_number", {})],
  ["storage.upload", await storage.upload("x.png", "blob")],
  ["storage.remove", await storage.remove(["x.png"])],
];

for (const [name, result] of writes) {
  report(`${name} rejected`, result.error?.code === "demo_read_only" && result.data === null);
}
report("every write notified", toasts === writes.length, `${toasts}/${writes.length}`);

// --- Verdict ----------------------------------------------------------------

console.log(
  failures.length
    ? `\n${failures.length} of ${checks} checks FAILED: ${failures.join(", ")}`
    : `\nAll ${checks} checks passed.`,
);

process.exit(failures.length > 0 ? 1 : 0);
