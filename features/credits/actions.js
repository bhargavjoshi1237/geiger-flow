// Data-access layer for the Credited Resources addon.
//
// Reads/writes target flow.credit_pools + flow.credit_allocations via the
// shared flowClient helper. RLS scopes every row to the row's project
// (credits.* abilities, open-module model). The DB stores snake_case; the UI
// works in camelCase.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { logActivity } from "@/features/activity_logs/actions";
import {
  DEFAULT_CREDIT_STATUS,
  DEFAULT_POOL_STATUS,
  DEFAULT_TARGET_TYPE,
} from "./constants";

const POOLS_TABLE = "credit_pools";
const ALLOCATIONS_TABLE = "credit_allocations";

export function normalizePool(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name ?? "",
    period: row.period ?? "",
    unit: row.unit ?? "tokens",
    total: Number(row.total) || 0,
    allocated: Number(row.allocated) || 0,
    used: Number(row.used) || 0,
    status: row.status ?? DEFAULT_POOL_STATUS,
    reset: row.reset_label ?? "",
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeAllocation(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    poolId: row.pool_id,
    target: row.target ?? "New allocation",
    targetType: row.target_type ?? DEFAULT_TARGET_TYPE,
    scope: row.scope ?? "",
    planned: Number(row.planned) || 0,
    used: Number(row.used) || 0,
    status: row.status ?? DEFAULT_CREDIT_STATUS,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPoolRow(input) {
  const row = {};

  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("period" in input) {
    row.period = input.period?.trim() || "";
  }
  if ("unit" in input) {
    row.unit = input.unit || "tokens";
  }
  if ("total" in input) {
    row.total = Math.max(0, Math.round(Number(input.total) || 0));
  }
  if ("allocated" in input) {
    row.allocated = Math.max(0, Math.round(Number(input.allocated) || 0));
  }
  if ("used" in input) {
    row.used = Math.max(0, Math.round(Number(input.used) || 0));
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_POOL_STATUS;
  }
  if ("reset" in input) {
    row.reset_label = input.reset?.trim() || "";
  }

  return row;
}

function toAllocationRow(input) {
  const row = {};

  if ("poolId" in input) {
    row.pool_id = input.poolId || null;
  }
  if ("target" in input) {
    row.target = input.target?.trim() || "New allocation";
  }
  if ("targetType" in input) {
    row.target_type = input.targetType || DEFAULT_TARGET_TYPE;
  }
  if ("scope" in input) {
    row.scope = input.scope?.trim() || "";
  }
  if ("planned" in input) {
    row.planned = Math.max(0, Math.round(Number(input.planned) || 0));
  }
  if ("used" in input) {
    row.used = Math.max(0, Math.round(Number(input.used) || 0));
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_CREDIT_STATUS;
  }

  return row;
}

export async function listCreditPools(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(POOLS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.credit_pools] list error:", error);
      return [];
    }

    return (data ?? []).map(normalizePool);
  } catch (error) {
    console.error("[flow.credit_pools] list error:", error);
    return [];
  }
}

export async function listCreditAllocations(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(ALLOCATIONS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.credit_allocations] list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeAllocation);
  } catch (error) {
    console.error("[flow.credit_allocations] list error:", error);
    return [];
  }
}

export async function createCreditPool(projectId, input) {
  if (!projectId || !input?.name?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toPoolRow(input),
    name: input.name.trim(),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  if (input.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(POOLS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.credit_pools] create error:", error);
      return null;
    }

    return normalizePool(data);
  } catch (error) {
    console.error("[flow.credit_pools] create error:", error);
    return null;
  }
}

export async function createCreditAllocation(projectId, input) {
  if (!projectId) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toAllocationRow(input),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  if (input?.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(ALLOCATIONS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.credit_allocations] create error:", error);
      return null;
    }

    void logActivity(projectId, {
      source: "credits",
      message: `Created credit allocation "${data.target}"`,
      detail: { id: data.id },
    }).catch(() => {});

    return normalizeAllocation(data);
  } catch (error) {
    console.error("[flow.credit_allocations] create error:", error);
    return null;
  }
}

export async function updateCreditPool(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toPoolRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(POOLS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.credit_pools] update error:", error);
      return null;
    }

    return normalizePool(data);
  } catch (error) {
    console.error("[flow.credit_pools] update error:", error);
    return null;
  }
}

export async function updateCreditAllocation(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toAllocationRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(ALLOCATIONS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.credit_allocations] update error:", error);
      return null;
    }

    return normalizeAllocation(data);
  } catch (error) {
    console.error("[flow.credit_allocations] update error:", error);
    return null;
  }
}

export async function softDeleteCreditPool(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(POOLS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.credit_pools] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.credit_pools] delete error:", error);
    return false;
  }
}

export async function softDeleteCreditAllocation(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(ALLOCATIONS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.credit_allocations] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.credit_allocations] delete error:", error);
    return false;
  }
}
