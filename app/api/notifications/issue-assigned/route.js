// Sends "you were assigned an issue" emails for newly-added assignees.
//
// The browser triggers this after an assignee change (see
// features/issues/notifications.js). Running server-side keeps the suite email
// key off the client and lets us resolve recipient emails from ids under the
// caller's RLS — a client never names a raw recipient address, so this can't be
// used as an open relay.
//
//   POST { issueId, assigneeIds }   -> { ok, sent }

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { sendSuiteEmail } from "@/lib/email/client";

export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://flow.geiger.studio";

function titleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const issueId = body?.issueId;
  const assigneeIds = Array.isArray(body?.assigneeIds)
    ? [...new Set(body.assigneeIds.filter(Boolean))]
    : [];

  if (!issueId || assigneeIds.length === 0) {
    return NextResponse.json(
      { ok: false, error: "issueId and assigneeIds are required" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Load the issue under the caller's RLS; if they can't see it, we send nothing.
  const { data: issue } = await supabase
    .schema("flow")
    .from("issues")
    .select("id, title, priority, due_date, project_id, assignee_ids")
    .eq("id", issueId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!issue) {
    return NextResponse.json({ ok: false, error: "Issue not found" }, { status: 404 });
  }

  // Only notify ids that are genuinely assigned now, and never the actor.
  const currentAssignees = issue.assignee_ids ?? [];
  const recipients = assigneeIds.filter(
    (id) => currentAssignees.includes(id) && id !== user.id
  );

  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const [{ data: profiles }, { data: project }] = await Promise.all([
    supabase
      .from("flow_profiles")
      .select("id, display_name, email")
      .in("id", recipients),
    supabase
      .from("projects")
      .select("name")
      .eq("id", issue.project_id)
      .maybeSingle(),
  ]);

  const assignerName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "A teammate";
  const projectName = project?.name || "your project";
  const issueUrl = `${APP_URL}/project/${issue.project_id}?Issues`;
  const priority = titleCase(issue.priority);
  const dueDate = formatDate(issue.due_date);

  const results = await Promise.allSettled(
    (profiles ?? [])
      .filter((profile) => profile.email)
      .map((profile) =>
        sendSuiteEmail({
          template: "flow.issue_assigned",
          to: profile.email,
          data: {
            recipientName:
              profile.display_name || profile.email.split("@")[0] || "there",
            issueTitle: issue.title,
            assignerName,
            projectName,
            priority,
            dueDate,
            issueUrl,
          },
        })
      )
  );

  const sent = results.filter(
    (result) => result.status === "fulfilled" && result.value?.ok
  ).length;

  return NextResponse.json({ ok: true, sent });
}
