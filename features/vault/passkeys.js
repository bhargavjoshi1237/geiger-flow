// Passkeys for the Vault: registering one, opening a secret with it, and listing or removing your own.
//
// Registering and opening run a WebAuthn ceremony through app/api/vault/passkeys and app/api/vault/reveal, which
// verify the credential on the server. Listing and removing read flow.member_passkeys under RLS (your rows only).

import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { flowClient } from "@/supabase/components/flow-client";
import { isDemoMode } from "@/supabase/demo/demo-mode";

const PASSKEYS_TABLE = "member_passkeys";

const ERROR_MESSAGES = {
  no_passkey: "Add a passkey before you open this secret.",
  forbidden: "You don't have access to this secret.",
  origin_not_allowed: "Passkeys aren't available on this address.",
  challenge_expired: "That took too long. Try again.",
  verification_failed: "Your passkey couldn't be verified.",
  unknown_passkey: "That passkey isn't registered to your account.",
  no_secret: "No secret is saved for this item.",
  not_configured: "Passkeys aren't set up on this server.",
  unauthorized: "Sign in again to use your passkey.",
  reauth_required: "To add a passkey, sign out and sign in again, then add it within 15 minutes.",
  playground: "Passkeys aren't available in the playground.",
};

export function passkeyErrorMessage(code) {
  return ERROR_MESSAGES[code] ?? "Something went wrong with your passkey. Try again.";
}

export function passkeysSupported() {
  return typeof window !== "undefined" && browserSupportsWebAuthn();
}

async function post(path, body) {
  // Prefix the configured basePath (production serves the app under /flow).
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  try {
    const res = await fetch(`${basePath}/api/vault/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return data ?? { ok: false, error: "request_failed" };
  } catch {
    return { ok: false, error: "request_failed" };
  }
}

// A cancelled or timed-out browser prompt resolves to { ok: false, error: "cancelled" }.
async function ceremony(run) {
  try {
    return await run();
  } catch (error) {
    if (error?.name === "NotAllowedError" || error?.name === "AbortError") {
      return { ok: false, error: "cancelled" };
    }
    console.error("[vault.passkeys] ceremony error:", error);
    return { ok: false, error: "verification_failed" };
  }
}

export async function registerPasskey(name) {
  if (isDemoMode()) {
    return { ok: false, error: "playground" };
  }

  const started = await post("passkeys", { step: "options" });
  if (!started.ok) {
    return started;
  }

  return ceremony(async () => {
    const response = await startRegistration({ optionsJSON: started.options });
    return post("passkeys", { step: "verify", response, name });
  });
}

// Returns { ok, secret } after the person confirms with one of their passkeys.
export async function revealWithPasskey(itemId) {
  if (isDemoMode()) {
    return { ok: false, error: "playground" };
  }

  const started = await post("reveal", { step: "options", itemId });
  if (!started.ok) {
    return started;
  }

  return ceremony(async () => {
    const response = await startAuthentication({ optionsJSON: started.options });
    return post("reveal", { step: "verify", itemId, response });
  });
}

export async function listMyPasskeys() {
  if (isDemoMode()) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(PASSKEYS_TABLE)
      .select("id, name, backed_up, created_at, last_used_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[flow.member_passkeys] list error:", error);
      return null;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      backedUp: row.backed_up,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
    }));
  } catch (error) {
    console.error("[flow.member_passkeys] list error:", error);
    return null;
  }
}

export async function removePasskey(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient().from(PASSKEYS_TABLE).delete().eq("id", id);
    if (error) {
      console.error("[flow.member_passkeys] delete error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[flow.member_passkeys] delete error:", error);
    return false;
  }
}
