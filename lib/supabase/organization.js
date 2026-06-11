export async function ensureUserOrganization(supabase) {
  const { data: organizationId, error } = await supabase.rpc(
    "flow_ensure_user_organization",
  );

  if (error) {
    throw error;
  }

  return organizationId;
}
