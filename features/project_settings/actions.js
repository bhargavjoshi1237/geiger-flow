// Data-access layer for the Project Settings feature.
//
// Reads/writes target flow.project_settings (one row per project) via the
// shared flowClient helper. Advanced toggles, enterprise toggles, add-on
// prefs, webhooks and env variables all live in the metadata expansion bag
// under section keys; writes go through the atomic
// flow.project_merge_settings() RPC so one tab shallow-merges its own keys
// and never clobbers another. Pure data access: validate,
// console.error("[flow.project_settings]") on failure, return null/false —
// never throw, never toast.

import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_ADDON_PREFS,
  DEFAULT_ADVANCED_SETTINGS,
  DEFAULT_ENTERPRISE_SETTINGS,
  DEFAULT_PROJECT_REGION,
  DEFAULT_PROJECT_VISIBILITY,
} from "./constants";

const SETTINGS_TABLE = "project_settings";

// DB row (snake_case) -> UI view model (camelCase). Section bags default every
// key so screens render without null checks.
export function normalizeProjectSettings(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};

  return {
    id: row.id,
    projectId: row.project_id,
    visibility: row.visibility ?? DEFAULT_PROJECT_VISIBILITY,
    region: row.region ?? DEFAULT_PROJECT_REGION,
    advanced: { ...DEFAULT_ADVANCED_SETTINGS, ...(metadata.advanced ?? {}) },
    enterprise: { ...DEFAULT_ENTERPRISE_SETTINGS, ...(metadata.enterprise ?? {}) },
    addons: {
      enabled: Array.isArray(metadata.addons?.enabled) ? metadata.addons.enabled : [...DEFAULT_ADDON_PREFS.enabled],
      navPositions:
        metadata.addons?.navPositions && typeof metadata.addons.navPositions === "object"
          ? metadata.addons.navPositions
          : {},
      colors:
        metadata.addons?.colors && typeof metadata.addons.colors === "object"
          ? metadata.addons.colors
          : {},
    },
    webhooks: Array.isArray(metadata.webhooks) ? metadata.webhooks : [],
    variables: Array.isArray(metadata.variables) ? metadata.variables : [],
    metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function defaultProjectSettings(projectId) {
  return {
    id: null,
    projectId,
    visibility: DEFAULT_PROJECT_VISIBILITY,
    region: DEFAULT_PROJECT_REGION,
    advanced: { ...DEFAULT_ADVANCED_SETTINGS },
    enterprise: { ...DEFAULT_ENTERPRISE_SETTINGS },
    addons: { enabled: [], navPositions: {}, colors: {} },
    webhooks: [],
    variables: [],
    metadata: {},
    createdAt: null,
    updatedAt: null,
  };
}

// The project's settings row, or null when absent/unreadable. Callers fall
// back to defaultProjectSettings(projectId) for rendering.
export async function getProjectSettings(projectId) {
  if (!projectId) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(SETTINGS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("[flow.project_settings] get error:", error);
      return null;
    }

    return normalizeProjectSettings(data);
  } catch (error) {
    console.error("[flow.project_settings] get error:", error);
    return null;
  }
}

// Shallow-merge a metadata patch ({ advanced, enterprise, addons, webhooks,
// variables }) via the atomic RPC. Falls back to a read-modify-write upsert
// when the RPC is unavailable.
export async function mergeProjectSettings(projectId, patch) {
  if (!projectId || !patch || typeof patch !== "object") {
    return null;
  }

  try {
    const { data, error } = await flowClient().rpc("project_merge_settings", {
      p_project_id: projectId,
      p_patch: patch,
    });

    if (!error && data) {
      return normalizeProjectSettings(data);
    }

    if (error) {
      console.error("[flow.project_settings] merge rpc error:", error);
    }
  } catch (error) {
    console.error("[flow.project_settings] merge rpc error:", error);
  }

  return mergeProjectSettingsFallback(projectId, patch);
}

async function mergeProjectSettingsFallback(projectId, patch) {
  try {
    const sb = flowClient();
    const { data: current } = await sb
      .from(SETTINGS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .maybeSingle();

    const metadata = {
      ...((current?.metadata && typeof current.metadata === "object" ? current.metadata : {})),
      ...patch,
    };

    const { data, error } = await sb
      .from(SETTINGS_TABLE)
      .upsert({ project_id: projectId, metadata }, { onConflict: "project_id" })
      .select()
      .single();

    if (error) {
      console.error("[flow.project_settings] merge fallback error:", error);
      return null;
    }

    return normalizeProjectSettings(data);
  } catch (error) {
    console.error("[flow.project_settings] merge fallback error:", error);
    return null;
  }
}

// Full-row update for the promoted columns (visibility, region). Metadata-bag
// writes go through mergeProjectSettings instead.
export async function updateProjectSettingsColumns(projectId, patch) {
  if (!projectId || !patch) {
    return null;
  }

  const row = {};
  if ("visibility" in patch) {
    row.visibility = patch.visibility || DEFAULT_PROJECT_VISIBILITY;
  }
  if ("region" in patch) {
    row.region = patch.region || DEFAULT_PROJECT_REGION;
  }
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const sb = flowClient();
    const { data: existing } = await sb
      .from(SETTINGS_TABLE)
      .select("id")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .maybeSingle();

    const query = existing
      ? sb.from(SETTINGS_TABLE).update(row).eq("project_id", projectId)
      : sb.from(SETTINGS_TABLE).insert({ project_id: projectId, ...row });

    const { data, error } = await query.select().single();

    if (error) {
      console.error("[flow.project_settings] columns update error:", error);
      return null;
    }

    return normalizeProjectSettings(data);
  } catch (error) {
    console.error("[flow.project_settings] columns update error:", error);
    return null;
  }
}
