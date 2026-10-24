// Server-only Supabase client with the service-role key, scoped to the flow schema.
//
// Used only for writes no member may make directly: WebAuthn challenges, passkey credentials, and the verified vault
// reveal after a passkey check. Never import this from client code; it returns null when the key isn't configured.

import { createClient } from "@supabase/supabase-js";

export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "flow" },
  });
}
