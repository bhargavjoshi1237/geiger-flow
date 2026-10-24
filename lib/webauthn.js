// WebAuthn settings and one-time challenges for vault passkeys. Server only.

const RP_NAME = "Geiger Flow";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_ORIGINS = [
  "https://geiger.studio",
  "https://flow.geiger.studio",
  "http://localhost:3000",
];

function allowedOrigins() {
  const fromEnv = process.env.WEBAUTHN_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_ORIGINS;
}

// The relying party for a request, taken from the page's Origin header; null when that origin isn't allowed.
export function relyingParty(request) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().includes(origin)) {
    return null;
  }

  const host = new URL(origin).hostname;
  // geiger.studio and flow.geiger.studio share one relying party, so a passkey works on both.
  const rpID = host === "geiger.studio" || host.endsWith(".geiger.studio") ? "geiger.studio" : host;
  return { origin, rpID, rpName: RP_NAME };
}

// Stores a fresh challenge, replacing any earlier one for the same person and purpose.
export async function saveChallenge(admin, { userId, purpose, itemId = null, challenge }) {
  await admin.from("webauthn_challenges").delete().lt("expires_at", new Date().toISOString());
  await admin.from("webauthn_challenges").delete().eq("user_id", userId).eq("purpose", purpose);

  const { error } = await admin.from("webauthn_challenges").insert({
    user_id: userId,
    purpose,
    item_id: itemId,
    challenge,
    expires_at: new Date(Date.now() + CHALLENGE_TTL_MS).toISOString(),
  });

  if (error) {
    console.error("[webauthn] save challenge error:", error);
    return false;
  }
  return true;
}

// Takes the person's live challenge for this purpose (and item), deleting it so it can't be replayed.
export async function consumeChallenge(admin, { userId, purpose, itemId = null }) {
  let query = admin
    .from("webauthn_challenges")
    .delete()
    .eq("user_id", userId)
    .eq("purpose", purpose)
    .gt("expires_at", new Date().toISOString());
  query = itemId ? query.eq("item_id", itemId) : query.is("item_id", null);

  const { data, error } = await query.select("challenge");
  if (error) {
    console.error("[webauthn] consume challenge error:", error);
    return null;
  }
  return data?.[0]?.challenge ?? null;
}
