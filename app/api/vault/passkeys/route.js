// Registers a passkey for the signed-in member, so they can open vault secrets that ask for one.
//
//   POST { step: "options" }                -> { ok, options }
//   POST { step: "verify", response, name } -> { ok, passkey }
//
// Listing and removing your own passkeys goes straight through RLS (features/vault/passkeys.js); only creating one
// needs the server, because the credential is verified here before it's stored.

import { NextResponse } from "next/server";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { consumeChallenge, relyingParty, saveChallenge } from "@/lib/webauthn";

export const runtime = "nodejs";

// Adding a passkey needs a recent sign-in, so a stolen session can't quietly enroll its own passkey.
const REAUTH_WINDOW_MS = 15 * 60 * 1000;

const fail = (error, status) => NextResponse.json({ ok: false, error }, { status });

function signedInRecently(user) {
  const signedInAt = Date.parse(user.last_sign_in_at ?? "");
  return Number.isFinite(signedInAt) && Date.now() - signedInAt <= REAUTH_WINDOW_MS;
}

export async function POST(request) {
  const rp = relyingParty(request);
  if (!rp) {
    return fail("origin_not_allowed", 403);
  }

  const body = await request.json().catch(() => null);
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail("unauthorized", 401);
  }
  if (!signedInRecently(user)) {
    return fail("reauth_required", 403);
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return fail("not_configured", 503);
  }

  if (body?.step === "options") {
    const { data: existing } = await admin
      .from("member_passkeys")
      .select("credential_id, transports")
      .eq("user_id", user.id);

    const options = await generateRegistrationOptions({
      rpName: rp.rpName,
      rpID: rp.rpID,
      userName: user.email || user.id,
      userDisplayName: user.user_metadata?.full_name || user.email || "",
      userID: new TextEncoder().encode(user.id),
      attestationType: "none",
      excludeCredentials: (existing ?? []).map((passkey) => ({
        id: passkey.credential_id,
        transports: passkey.transports,
      })),
      authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
    });

    const saved = await saveChallenge(admin, {
      userId: user.id,
      purpose: "register",
      challenge: options.challenge,
    });
    return saved ? NextResponse.json({ ok: true, options }) : fail("challenge_failed", 500);
  }

  if (body?.step === "verify") {
    const expectedChallenge = await consumeChallenge(admin, { userId: user.id, purpose: "register" });
    if (!expectedChallenge) {
      return fail("challenge_expired", 400);
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body.response,
        expectedChallenge,
        expectedOrigin: rp.origin,
        expectedRPID: rp.rpID,
        requireUserVerification: true,
      });
    } catch (error) {
      console.error("[vault.passkeys] verify error:", error);
      return fail("verification_failed", 400);
    }
    if (!verification.verified) {
      return fail("verification_failed", 400);
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    const name = String(body.name || "").trim().slice(0, 60) || "Passkey";

    const { data, error } = await admin
      .from("member_passkeys")
      .insert({
        user_id: user.id,
        credential_id: credential.id,
        public_key: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports ?? [],
        device_type: credentialDeviceType,
        backed_up: credentialBackedUp,
        name,
      })
      .select("id, name, created_at, last_used_at, backed_up")
      .single();

    if (error) {
      console.error("[vault.passkeys] save error:", error);
      return fail("save_failed", 500);
    }
    return NextResponse.json({ ok: true, passkey: data });
  }

  return fail("bad_request", 400);
}
