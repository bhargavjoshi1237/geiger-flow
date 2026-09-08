// Data-access layer for the Security feature.
//
// Reads/writes target the four flow security tables — flow.security_policies,
// flow.security_vulnerabilities, flow.security_access_events and
// flow.api_keys — via the shared flowClient helper. RLS scopes every row to
// members of the row's project (open-module model). The DB stores snake_case
// columns, the UI works in camelCase, so this module adapts between the two
// (toRow / normalize*) and always returns view-model objects the screen can
// render directly.
//
// api_keys stores a short non-secret prefix ONLY; the full secret never leaves
// the client that minted it.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_ENFORCEMENT,
  DEFAULT_RESULT,
  DEFAULT_SEVERITY,
  DEFAULT_VULNERABILITY_STATUS,
} from "./constants";

const POLICIES_TABLE = "security_policies";
const VULNERABILITIES_TABLE = "security_vulnerabilities";
const ACCESS_EVENTS_TABLE = "security_access_events";
const API_KEYS_TABLE = "api_keys";

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

export function normalizePolicy(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name ?? "",
    scope: row.scope ?? "",
    enforcement: row.enforcement ?? DEFAULT_ENFORCEMENT,
    isEnabled: row.is_enabled ?? true,
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPolicyRow(input) {
  const row = {};

  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("scope" in input) {
    row.scope = input.scope?.trim() || null;
  }
  if ("enforcement" in input) {
    row.enforcement = input.enforcement || DEFAULT_ENFORCEMENT;
  }
  if ("isEnabled" in input) {
    row.is_enabled = Boolean(input.isEnabled);
  }

  return row;
}

export async function listSecurityPolicies(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(POLICIES_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.security] list policies error:", error);
      return null;
    }

    return (data ?? []).map(normalizePolicy);
  } catch (error) {
    console.error("[flow.security] list policies error:", error);
    return null;
  }
}

// Honors a caller-supplied `id` so the optimistic card and the stored row share
// a UUID.
export async function createSecurityPolicy(projectId, input) {
  if (!projectId || !input?.name?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toPolicyRow(input),
    project_id: projectId,
    created_by: user?.id ?? null,
  };
  if (input.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(POLICIES_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.security] create policy error:", error);
      return null;
    }

    return normalizePolicy(data);
  } catch (error) {
    console.error("[flow.security] create policy error:", error);
    return null;
  }
}

export async function updateSecurityPolicy(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toPolicyRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(POLICIES_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.security] update policy error:", error);
      return null;
    }

    return normalizePolicy(data);
  } catch (error) {
    console.error("[flow.security] update policy error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteSecurityPolicy(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(POLICIES_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.security] delete policy error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.security] delete policy error:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Vulnerabilities
// ---------------------------------------------------------------------------

export function normalizeVulnerability(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title ?? "",
    severity: row.severity ?? DEFAULT_SEVERITY,
    status: row.status ?? DEFAULT_VULNERABILITY_STATUS,
    affected: row.affected ?? "",
    detectedOn: row.detected_on ?? null,
    resolvedAt: row.resolved_at ?? null,
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toVulnerabilityRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("severity" in input) {
    row.severity = input.severity || DEFAULT_SEVERITY;
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_VULNERABILITY_STATUS;
  }
  if ("affected" in input) {
    row.affected = input.affected?.trim() || null;
  }
  if ("detectedOn" in input) {
    row.detected_on = input.detectedOn || null;
  }
  if ("resolvedAt" in input) {
    // "" -> null so reopening a finding clears the resolution stamp too.
    row.resolved_at = input.resolvedAt || null;
  }

  return row;
}

export async function listVulnerabilities(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(VULNERABILITIES_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.security] list vulnerabilities error:", error);
      return null;
    }

    return (data ?? []).map(normalizeVulnerability);
  } catch (error) {
    console.error("[flow.security] list vulnerabilities error:", error);
    return null;
  }
}

// Honors a caller-supplied `id` so the optimistic row and the stored row share
// a UUID.
export async function createVulnerability(projectId, input) {
  if (!projectId || !input?.title?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toVulnerabilityRow(input),
    project_id: projectId,
    created_by: user?.id ?? null,
  };
  if (input.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(VULNERABILITIES_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.security] create vulnerability error:", error);
      return null;
    }

    return normalizeVulnerability(data);
  } catch (error) {
    console.error("[flow.security] create vulnerability error:", error);
    return null;
  }
}

export async function updateVulnerability(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toVulnerabilityRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(VULNERABILITIES_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.security] update vulnerability error:", error);
      return null;
    }

    return normalizeVulnerability(data);
  } catch (error) {
    console.error("[flow.security] update vulnerability error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteVulnerability(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(VULNERABILITIES_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.security] delete vulnerability error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.security] delete vulnerability error:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Access events
// ---------------------------------------------------------------------------

export function normalizeAccessEvent(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    actor: row.actor ?? "",
    action: row.action ?? "",
    target: row.target ?? "",
    result: row.result ?? DEFAULT_RESULT,
    occurredAt: row.occurred_at ?? null,
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAccessEventRow(input) {
  const row = {};

  if ("actor" in input) {
    row.actor = input.actor?.trim() || null;
  }
  if ("action" in input) {
    row.action = input.action?.trim();
  }
  if ("target" in input) {
    row.target = input.target?.trim() || null;
  }
  if ("result" in input) {
    row.result = input.result || DEFAULT_RESULT;
  }
  if ("occurredAt" in input) {
    row.occurred_at = input.occurredAt || null;
  }

  return row;
}

export async function listAccessEvents(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(ACCESS_EVENTS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false });

    if (error) {
      console.error("[flow.security] list access events error:", error);
      return null;
    }

    return (data ?? []).map(normalizeAccessEvent);
  } catch (error) {
    console.error("[flow.security] list access events error:", error);
    return null;
  }
}

export async function createAccessEvent(projectId, input) {
  if (!projectId || !input?.action?.trim()) {
    return null;
  }

  const payload = {
    ...toAccessEventRow(input),
    project_id: projectId,
  };

  try {
    const { data, error } = await flowClient()
      .from(ACCESS_EVENTS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.security] create access event error:", error);
      return null;
    }

    return normalizeAccessEvent(data);
  } catch (error) {
    console.error("[flow.security] create access event error:", error);
    return null;
  }
}

// Best-effort audit trail writer — used by this module when an API key is
// created and available to the screen for other sensitive actions. Never
// throws and never blocks the caller's flow: every failure is swallowed after
// being logged.
export async function recordAccessEvent(projectId, { actor, action, target, result } = {}) {
  try {
    if (!projectId || !action?.trim()) {
      return false;
    }

    let resolvedActor = actor?.trim() || null;
    if (!resolvedActor) {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error("[flow.security] access-event user lookup error:", userError);
      }
      resolvedActor = user?.email ?? user?.id ?? null;
    }

    const ok = await createAccessEvent(projectId, {
      actor: resolvedActor,
      action,
      target,
      result: result || DEFAULT_RESULT,
    });

    return Boolean(ok);
  } catch (error) {
    console.error("[flow.security] record access event error:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// API keys — prefix only, NEVER the full secret
// ---------------------------------------------------------------------------

export function normalizeApiKey(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name ?? "",
    keyPrefix: row.key_prefix ?? "",
    scopes: row.scopes ?? [],
    lastUsedAt: row.last_used_at ?? null,
    expiresAt: row.expires_at ?? null,
    isRevoked: row.is_revoked ?? false,
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toApiKeyRow(input) {
  const row = {};

  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("keyPrefix" in input) {
    row.key_prefix = input.keyPrefix?.trim();
  }
  if ("scopes" in input) {
    row.scopes = Array.isArray(input.scopes) ? input.scopes : [];
  }
  if ("lastUsedAt" in input) {
    row.last_used_at = input.lastUsedAt || null;
  }
  if ("expiresAt" in input) {
    row.expires_at = input.expiresAt || null;
  }
  if ("isRevoked" in input) {
    row.is_revoked = Boolean(input.isRevoked);
  }

  return row;
}

export async function listApiKeys(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(API_KEYS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.security] list api keys error:", error);
      return null;
    }

    return (data ?? []).map(normalizeApiKey);
  } catch (error) {
    console.error("[flow.security] list api keys error:", error);
    return null;
  }
}

// Honors a caller-supplied `id` so the optimistic row and the stored row share
// a UUID. Records a best-effort access event on success.
export async function createApiKey(projectId, input) {
  if (!projectId || !input?.name?.trim() || !input?.keyPrefix?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toApiKeyRow(input),
    project_id: projectId,
    created_by: user?.id ?? null,
  };
  if (input.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(API_KEYS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.security] create api key error:", error);
      return null;
    }

    void recordAccessEvent(projectId, {
      action: "api_key.create",
      target: `${data.name} (${data.key_prefix})`,
      result: "allowed",
    });

    return normalizeApiKey(data);
  } catch (error) {
    console.error("[flow.security] create api key error:", error);
    return null;
  }
}

export async function updateApiKey(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toApiKeyRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(API_KEYS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.security] update api key error:", error);
      return null;
    }

    return normalizeApiKey(data);
  } catch (error) {
    console.error("[flow.security] update api key error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteApiKey(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(API_KEYS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.security] delete api key error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.security] delete api key error:", error);
    return false;
  }
}
