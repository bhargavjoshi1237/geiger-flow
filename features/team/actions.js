// Data-access layer for the Team feature.
//
// All reads/writes target the dedicated `flow` Postgres schema
// (flow.project_members — one row per member) via `.schema("flow")`.
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalizeMember) and always returns
// view-model objects the screen can render directly.
//
// Display names are stamped into the metadata bag at invite time
// ({ authorName }) so rows stay self-contained; they fall back to the email
// prefix. This module is the CONTRACT the Overview track consumes — the
// `listMembers` export name is load-bearing.

"use client";

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_MEMBER_ROLE,
  DEFAULT_MEMBER_STATUS,
  MEMBER_ROLES,
  MEMBER_STATUSES,
} from "./constants";

const MEMBERS_TABLE = "project_members";

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys
// are spread onto the view model so the UI treats them like first-class
// fields.
export function normalizeMember(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};
  const email = row.email ?? "";

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id ?? null,
    email,
    name: metadata.authorName || email.split("@")[0] || "",
    role: row.role ?? DEFAULT_MEMBER_ROLE,
    status: row.status ?? DEFAULT_MEMBER_STATUS,
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...metadata,
  };
}

// Maps camelCase member fields to DB columns. Only keys present in `input`
// are emitted, so one helper serves invites and partial updates ({ role }).
export function toRow(input) {
  const row = {};

  if ("email" in input) {
    row.email = input.email?.trim() || null;
  }
  if ("role" in input) {
    row.role = input.role || DEFAULT_MEMBER_ROLE;
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_MEMBER_STATUS;
  }
  if ("userId" in input) {
    row.user_id = input.userId ?? null;
  }
  if ("name" in input) {
    row.metadata = { authorName: input.name?.trim() || null };
  }

  return row;
}

export async function listMembers(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(MEMBERS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[flow.team] listMembers error:", error);
      return [];
    }

    return (data ?? []).map(normalizeMember);
  } catch (error) {
    console.error("[flow.team] listMembers error:", error);
    return [];
  }
}

// Honors a caller-supplied `id` so the optimistic row and the stored row
// share a UUID.
export async function inviteMember(projectId, input) {
  const email = input?.email?.trim();
  if (!projectId || !email) {
    return null;
  }

  const role = input.role || DEFAULT_MEMBER_ROLE;
  if (!MEMBER_ROLES.includes(role)) {
    console.error("[flow.team] inviteMember error: invalid role:", input.role);
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[flow.team] user lookup error:", userError);
    }

    const payload = {
      ...toRow({ email, role, status: input.status || DEFAULT_MEMBER_STATUS }),
      project_id: projectId,
      created_by: user?.id ?? null,
    };

    // Fold the display name into the metadata bag without clobbering toRow.
    if (input.name?.trim()) {
      payload.metadata = { authorName: input.name.trim() };
    } else if (email) {
      payload.metadata = { authorName: email.split("@")[0] };
    }

    // Honor a caller-supplied id so optimistic rows and the DB row share a UUID.
    if (input.id) {
      payload.id = input.id;
    }

    const { data, error } = await flowClient()
      .from(MEMBERS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.team] inviteMember error:", error);
      return null;
    }

    return normalizeMember(data);
  } catch (error) {
    console.error("[flow.team] inviteMember error:", error);
    return null;
  }
}

export async function updateMemberRole(id, role) {
  if (!id || !role) {
    return null;
  }

  if (!MEMBER_ROLES.includes(role)) {
    console.error("[flow.team] updateMemberRole error: invalid role:", role);
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(MEMBERS_TABLE)
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.team] updateMemberRole error:", error);
      return null;
    }

    return normalizeMember(data);
  } catch (error) {
    console.error("[flow.team] updateMemberRole error:", error);
    return null;
  }
}

export async function updateMemberStatus(id, status) {
  if (!id || !status) {
    return null;
  }

  if (!MEMBER_STATUSES.includes(status)) {
    console.error(
      "[flow.team] updateMemberStatus error: invalid status:",
      status,
    );
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(MEMBERS_TABLE)
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.team] updateMemberStatus error:", error);
      return null;
    }

    return normalizeMember(data);
  } catch (error) {
    console.error("[flow.team] updateMemberStatus error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteMember(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(MEMBERS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.team] delete member error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.team] delete member error:", error);
    return false;
  }
}
