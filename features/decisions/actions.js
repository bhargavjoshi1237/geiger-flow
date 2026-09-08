// Data-access layer for the Decisions feature (decision memory).
//
// Reads/writes target flow.decisions via the shared flowClient helper. RLS
// scopes every row to members of the decision's project (open-module model).
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";

const DECISIONS_TABLE = "decisions";

export function normalizeDecision(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    rationale: row.rationale ?? "",
    status: row.status ?? "proposed",
    owner: row.owner ?? "",
    reversibility: row.reversibility ?? "reversible",
    reviewDate: row.review_date,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("rationale" in input) {
    row.rationale = input.rationale?.trim() || null;
  }
  if ("status" in input) {
    row.status = input.status || "proposed";
  }
  if ("owner" in input) {
    row.owner = input.owner?.trim() || null;
  }
  if ("reversibility" in input) {
    row.reversibility = input.reversibility || "reversible";
  }
  if ("reviewDate" in input) {
    row.review_date = input.reviewDate || null;
  }

  return row;
}

export async function listDecisions(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(DECISIONS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.decisions] list error:", error);
      return null;
    }

    return (data ?? []).map(normalizeDecision);
  } catch (error) {
    console.error("[flow.decisions] list error:", error);
    return null;
  }
}

export async function createDecision(projectId, input) {
  if (!projectId || !input?.title?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toRow({
      title: input.title,
      rationale: input.rationale ?? "",
      status: input.status,
      owner: input.owner ?? "",
      reversibility: input.reversibility,
      reviewDate: input.reviewDate,
    }),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  try {
    const { data, error } = await flowClient()
      .from(DECISIONS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.decisions] create error:", error);
      return null;
    }

    return normalizeDecision(data);
  } catch (error) {
    console.error("[flow.decisions] create error:", error);
    return null;
  }
}

export async function updateDecision(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(DECISIONS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.decisions] update error:", error);
      return null;
    }

    return normalizeDecision(data);
  } catch (error) {
    console.error("[flow.decisions] update error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteDecision(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(DECISIONS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.decisions] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.decisions] delete error:", error);
    return false;
  }
}
