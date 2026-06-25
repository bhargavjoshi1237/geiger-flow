// Shared lookups for user profiles (flow_profiles) used to render authors
// (name + avatar) across features. Mirrors how team.jsx / profile_dropdown read
// display_name / avatar_url and the public `pfp/{id}/latest.jpg` storage path.

import { createClient } from "./client";

const PFP_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pfp`
  : "";

export function profilePfpUrl(id) {
  return id && PFP_BASE ? `${PFP_BASE}/${id}/latest.jpg` : null;
}

export function profileInitials(name) {
  const initials = (name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return initials || "?";
}

function normalizeProfile(row) {
  const name = row.display_name || row.email?.split("@")[0] || "Member";

  return {
    id: row.id,
    name,
    email: row.email || "",
    // Prefer an explicit avatar_url, else the conventional public pfp path.
    avatarUrl: row.avatar_url || profilePfpUrl(row.id),
    initials: profileInitials(name),
  };
}

// Build a view-model profile from the current session user (getUser() shape),
// so the signed-in author resolves even if their flow_profiles row is missing.
export function profileFromUser(user) {
  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    name: user.name || "You",
    email: user.email || "",
    avatarUrl: user.avatar || profilePfpUrl(user.id),
    initials: profileInitials(user.name),
  };
}

// List all member profiles for an organization (for assignee pickers etc.).
export async function listOrgMembers(organizationId) {
  if (!organizationId) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("flow_profiles")
    .select("id, display_name, email, avatar_url")
    .eq("organization_id", organizationId)
    .order("display_name", { ascending: true });

  if (error) {
    console.error("[profiles] members fetch error:", error);
    return [];
  }

  return (data ?? []).map(normalizeProfile);
}

// Fetch profiles for a set of user ids -> map keyed by id.
export async function getProfilesByIds(ids) {
  const unique = [...new Set((ids || []).filter(Boolean))];
  if (unique.length === 0) {
    return {};
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("flow_profiles")
    .select("id, display_name, email, avatar_url")
    .in("id", unique);

  if (error) {
    console.error("[profiles] fetch error:", error);
    return {};
  }

  const map = {};
  for (const row of data ?? []) {
    map[row.id] = normalizeProfile(row);
  }
  return map;
}
