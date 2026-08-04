"use client";

import { createClient } from "@/lib/supabase/client";

// Data access for public.user_nav_prefs — the sidebar entries a user has hidden.
//
// This table is SUITE-WIDE, not a flow table: sidebar curation is a property of
// the user, not of the flow domain. It lives in the shared `public` schema
// (owned and migrated by geiger-dash) and is keyed by
// (product, surface, project_id, user_id), so every Geiger app reads and writes
// the same table without colliding on shared titles like "Overview" or "Team".
//
// Flow's own tables go through flowClient() (schema "flow"); this one is public,
// so a plain createClient() is correct here.
//
// DB is snake_case, the UI is camelCase; map at this boundary. Pure: validate,
// console.error on failure, return null/false — never throw, never toast.

const TABLE = "user_nav_prefs";
const PRODUCT = "flow";
const SURFACE = "project";

export function normalizeNavPrefs(row) {
  if (!row) return null;
  return {
    id: row.id,
    product: row.product ?? PRODUCT,
    surface: row.surface ?? SURFACE,
    projectId: row.project_id ?? null,
    userId: row.user_id ?? null,
    hidden: Array.isArray(row.hidden) ? row.hidden.filter((t) => typeof t === "string") : [],
  };
}

// This user's row for the project. `null` means a failed read or simply no row
// yet — the caller treats both as "nothing hidden".
export async function getNavPrefs(projectId, userId = null) {
  if (!projectId) return null;
  try {
    let query = createClient()
      .from(TABLE)
      .select("*")
      .eq("product", PRODUCT)
      .eq("surface", SURFACE)
      .eq("project_id", projectId);
    query = userId ? query.eq("user_id", userId) : query.is("user_id", null);

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("[nav_prefs.get]", error.message);
      return null;
    }
    return normalizeNavPrefs(data);
  } catch (e) {
    console.error("[nav_prefs.get]", e);
    return null;
  }
}

// Create-or-update this user's single row. The whole hidden list is written at
// once — it is small, and a partial patch would need a read-modify-write round
// trip for no benefit. The unique constraint on
// (product, surface, project_id, user_id) is the upsert target.
export async function saveNavPrefs(projectId, userId, hidden) {
  if (!projectId) return false;
  try {
    const { error } = await createClient().from(TABLE).upsert(
      {
        product: PRODUCT,
        surface: SURFACE,
        project_id: projectId,
        user_id: userId || null,
        hidden: Array.isArray(hidden) ? hidden : [],
        created_by: userId || null,
      },
      { onConflict: "product,surface,project_id,user_id" },
    );
    if (error) {
      console.error("[nav_prefs.save]", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[nav_prefs.save]", e);
    return false;
  }
}
