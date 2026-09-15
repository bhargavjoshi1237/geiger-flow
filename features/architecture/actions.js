// Data-access layer for the System Architecture addon.
//
// Reads/writes target flow.architecture_diagrams via the shared flowClient
// helper. One live diagram per project (unique index on project_id where
// deleted_at is null); nodes/edges ride as jsonb columns, canvas extras in
// the metadata bag. The DB stores snake_case; the UI works in camelCase.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { logActivity } from "@/features/activity_logs/actions";
import { DEFAULT_DIAGRAM_TITLE } from "./constants";

const TABLE = "architecture_diagrams";

export function normalizeDiagram(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title ?? DEFAULT_DIAGRAM_TITLE,
    nodes: Array.isArray(row.nodes) ? row.nodes : [],
    edges: Array.isArray(row.edges) ? row.edges : [],
    viewport: row.viewport ?? null,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim() || DEFAULT_DIAGRAM_TITLE;
  }
  if ("nodes" in input) {
    row.nodes = Array.isArray(input.nodes) ? input.nodes : [];
  }
  if ("edges" in input) {
    row.edges = Array.isArray(input.edges) ? input.edges : [];
  }
  if ("viewport" in input) {
    row.viewport = input.viewport ?? null;
  }

  return row;
}

export async function getDiagram(projectId) {
  if (!projectId) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[flow.architecture_diagrams] get error:", error);
      return null;
    }

    return normalizeDiagram(data);
  } catch (error) {
    console.error("[flow.architecture_diagrams] get error:", error);
    return null;
  }
}

export async function listDiagrams(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[flow.architecture_diagrams] list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeDiagram);
  } catch (error) {
    console.error("[flow.architecture_diagrams] list error:", error);
    return [];
  }
}

export async function createDiagram(projectId, input) {
  if (!projectId) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toRow(input ?? {}),
    title: input?.title?.trim() || DEFAULT_DIAGRAM_TITLE,
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  if (input?.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.architecture_diagrams] create error:", error);
      return null;
    }

    void logActivity(projectId, {
      source: "architecture",
      message: `Saved architecture diagram "${data.title}"`,
      detail: { id: data.id },
    }).catch(() => {});

    return normalizeDiagram(data);
  } catch (error) {
    console.error("[flow.architecture_diagrams] create error:", error);
    return null;
  }
}

export async function updateDiagram(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.architecture_diagrams] update error:", error);
      return null;
    }

    return normalizeDiagram(data);
  } catch (error) {
    console.error("[flow.architecture_diagrams] update error:", error);
    return null;
  }
}

// Get-or-create the project's live diagram so the canvas always has a row to
// autosave against.
export async function ensureDiagram(projectId, seed) {
  const existing = await getDiagram(projectId);
  if (existing) {
    return existing;
  }

  return createDiagram(projectId, {
    title: seed?.title || DEFAULT_DIAGRAM_TITLE,
    nodes: seed?.nodes ?? [],
    edges: seed?.edges ?? [],
    viewport: seed?.viewport ?? null,
  });
}

export async function softDeleteDiagram(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.architecture_diagrams] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.architecture_diagrams] delete error:", error);
    return false;
  }
}
