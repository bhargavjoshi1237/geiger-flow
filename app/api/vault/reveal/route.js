// Opens a vault secret that asks for a passkey, after verifying the signed-in member's own passkey.
//
//   POST { step: "options", itemId }          -> { ok, options }
//   POST { step: "verify", itemId, response } -> { ok, secret }
//
// PIN and password secrets never come through here: flow.vault_reveal checks those in the database. This route is
// the only caller of flow.vault_reveal_verified, which re-checks access and records the open.

import { NextResponse } from "next/server";
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { consumeChallenge, relyingParty, saveChallenge } from "@/lib/webauthn";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { "Cache-Control": "no-store" };

const fail = (error, status) => NextResponse.json({ ok: false, error }, { status, headers: NO_STORE });

export async function POST(request) {
  const rp = relyingParty(request);
  if (!rp) {
    return fail("origin_not_allowed", 403);
  }

  const body = await request.json().catch(() => null);
  const itemId = body?.itemId;
  if (!UUID.test(itemId ?? "")) {
    return fail("bad_request", 400);
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail("unauthorized", 401);
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return fail("not_configured", 503);
  }

  // Checked again inside flow.vault_reveal_verified; checking here avoids asking for a passkey that can't help.
  const { data: canOpen } = await admin.rpc("vault_can_open", { p_item_id: itemId, p_user_id: user.id });
  if (!canOpen) {
    return fail("forbidden", 403);
  }

  const { data: item } = await admin
    .from("vault_items")
    .select("access_method")
    .eq("id", itemId)
    .is("deleted_at", null)
    .maybeSingle();
  if (item?.access_method !== "passkey") {
    return fail("code_required", 400);
  }

  const { data: passkeys } = await admin.from("member_passkeys").select("*").eq("user_id", user.id);
  if (!passkeys?.length) {
    return fail("no_passkey", 409);
  }

  if (body.step === "options") {
    const options = await generateAuthenticationOptions({
      rpID: rp.rpID,
      allowCredentials: passkeys.map((passkey) => ({
        id: passkey.credential_id,
        transports: passkey.transports,
      })),
      userVerification: "required",
    });

    const saved = await saveChallenge(admin, {
      userId: user.id,
      purpose: "reveal",
      itemId,
      challenge: options.challenge,
    });
    return saved ? NextResponse.json({ ok: true, options }) : fail("challenge_failed", 500);
  }

  if (body.step === "verify") {
    const expectedChallenge = await consumeChallenge(admin, { userId: user.id, purpose: "reveal", itemId });
    if (!expectedChallenge) {
      return fail("challenge_expired", 400);
    }

    const passkey = passkeys.find((entry) => entry.credential_id === body.response?.id);
    if (!passkey) {
      return fail("unknown_passkey", 400);
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body.response,
        expectedChallenge,
        expectedOrigin: rp.origin,
        expectedRPID: rp.rpID,
        credential: {
          id: passkey.credential_id,
          publicKey: isoBase64URL.toBuffer(passkey.public_key),
          counter: Number(passkey.counter),
          transports: passkey.transports,
        },
        requireUserVerification: true,
      });
    } catch (error) {
      console.error("[vault.reveal] verify error:", error);
      return fail("verification_failed", 400);
    }
    if (!verification.verified) {
      return fail("verification_failed", 400);
    }

    await admin
      .from("member_passkeys")
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", passkey.id);

    const { data: result, error } = await admin.rpc("vault_reveal_verified", {
      p_item_id: itemId,
      p_user_id: user.id,
    });
    if (error) {
      console.error("[vault.reveal] reveal error:", error);
      return fail("reveal_failed", 500);
    }
    return NextResponse.json(result, { status: result?.ok ? 200 : 403, headers: NO_STORE });
  }

  return fail("bad_request", 400);
}
