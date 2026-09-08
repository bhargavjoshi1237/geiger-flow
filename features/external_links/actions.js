// Data-access layer for the project external links feature.
//
// Reads/writes target flow.external_links via the shared flowClient helper. RLS
// scopes every row to members of the link's project (open-module model). Display
// options (textColor, showOnTopbar, showOnDashboard, openInNewTab) live in the
// metadata bag and surface as first-class fields on the view model, so callers
// keep working with the same shape the localStorage version produced.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";

const EXTERNAL_LINKS_TABLE = "external_links";

export function normalizeExternalLink(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    url: row.url,
    icon: row.icon ?? "ExternalLink",
    textColor: metadata.textColor ?? "#737373",
    showOnTopbar: metadata.showOnTopbar ?? true,
    showOnDashboard: metadata.showOnDashboard ?? true,
    openInNewTab: metadata.openInNewTab ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("url" in input) {
    row.url = input.url?.trim();
  }
  if ("icon" in input) {
    row.icon = input.icon || "ExternalLink";
  }

  const metadataKeys = ["textColor", "showOnTopbar", "showOnDashboard", "openInNewTab"];
  if (metadataKeys.some((key) => key in input)) {
    row.metadata = {
      textColor: input.textColor ?? "#737373",
      showOnTopbar: input.showOnTopbar ?? true,
      showOnDashboard: input.showOnDashboard ?? true,
      openInNewTab: input.openInNewTab ?? true,
    };
  }

  return row;
}

export async function listExternalLinks(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(EXTERNAL_LINKS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.external_links] list error:", error);
      return null;
    }

    return (data ?? []).map(normalizeExternalLink);
  } catch (error) {
    console.error("[flow.external_links] list error:", error);
    return null;
  }
}

// Honors a caller-supplied `id` so the optimistic link and the stored row share
// a UUID.
export async function createExternalLink(projectId, input) {
  if (!projectId || !input?.title?.trim() || !input?.url?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toRow(input),
    project_id: projectId,
    created_by: user?.id ?? null,
  };
  if (input.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(EXTERNAL_LINKS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.external_links] create error:", error);
      return null;
    }

    return normalizeExternalLink(data);
  } catch (error) {
    console.error("[flow.external_links] create error:", error);
    return null;
  }
}

export async function updateExternalLink(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(EXTERNAL_LINKS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.external_links] update error:", error);
      return null;
    }

    return normalizeExternalLink(data);
  } catch (error) {
    console.error("[flow.external_links] update error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteExternalLink(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(EXTERNAL_LINKS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.external_links] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.external_links] delete error:", error);
    return false;
  }
}
