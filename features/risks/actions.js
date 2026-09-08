// Data-access layer for the Risks feature.
//
// Reads/writes target flow.risks via the shared flowClient helper. RLS scopes
// every row to members of the risk's project (open-module model). Exposure is
// not stored — it is derived in the UI from probability x impact (see
// features/risks/constants.js). The DB stores snake_case columns; the UI works
// in camelCase, so this module adapts between the two.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";

const RISKS_TABLE = "risks";

export function normalizeRisk(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? "",
    status: row.status ?? "open",
    owner: row.owner ?? "",
    probability: Number(row.probability) || 0,
    impact: row.impact ?? "medium",
    mitigation: row.mitigation ?? "",
    reviewDate: row.review_date,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Emits a column only when its key is present in `input`, so one updateRisk
// serves both a full-form save and a single-field inline edit ({ status }).
function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("description" in input) {
    row.description = input.description?.trim() || null;
  }
  if ("status" in input) {
    row.status = input.status || "open";
  }
  if ("owner" in input) {
    row.owner = input.owner?.trim() || null;
  }
  if ("probability" in input) {
    const value = Number(input.probability);
    row.probability = Number.isFinite(value)
      ? Math.min(100, Math.max(0, Math.round(value)))
      : 50;
  }
  if ("impact" in input) {
    row.impact = input.impact || "medium";
  }
  if ("mitigation" in input) {
    row.mitigation = input.mitigation?.trim() || null;
  }
  if ("reviewDate" in input) {
    row.review_date = input.reviewDate || null;
  }

  return row;
}

export async function listRisks(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(RISKS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[flow.risks] list error:", error);
      return null;
    }

    return (data ?? []).map(normalizeRisk);
  } catch (error) {
    console.error("[flow.risks] list error:", error);
    return null;
  }
}

export async function createRisk(projectId, input) {
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
      description: input.description ?? "",
      status: input.status,
      owner: input.owner ?? "",
      probability: input.probability,
      impact: input.impact,
      mitigation: input.mitigation ?? "",
      reviewDate: input.reviewDate,
    }),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  try {
    const { data, error } = await flowClient()
      .from(RISKS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.risks] create error:", error);
      return null;
    }

    return normalizeRisk(data);
  } catch (error) {
    console.error("[flow.risks] create error:", error);
    return null;
  }
}

export async function updateRisk(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(RISKS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.risks] update error:", error);
      return null;
    }

    return normalizeRisk(data);
  } catch (error) {
    console.error("[flow.risks] update error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteRisk(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(RISKS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.risks] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.risks] delete error:", error);
    return false;
  }
}
