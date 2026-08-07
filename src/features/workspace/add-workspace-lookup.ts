import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AddWorkspaceLookup =
  | {
      kind: "claim";
      companyId: string;
      companyName: string;
      companySlug: string;
      inviteEmail: string;
    }
  | {
      kind: "owned";
      companyId: string;
      companyName: string;
      companySlug: string;
      email: string;
    }
  | {
      kind: "missing";
      email: string;
    };

/**
 * Find claimable draft by exact invite_email match only.
 * Never returns claim_token. Domain-only lookups removed (token oracle).
 * Caller must be signed in as that invite email to claim.
 */
export async function lookupAddWorkspace(
  rawEmail: string,
): Promise<AddWorkspaceLookup | { kind: "error"; error: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { kind: "error", error: "Enter a valid work email." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kind: "error", error: "Sign in required." };

  const sessionEmail = user.email?.trim().toLowerCase() ?? "";
  if (!sessionEmail || sessionEmail !== email) {
    return {
      kind: "error",
      error:
        "Sign in with the invite email for that company, then look it up again.",
    };
  }

  const admin = createAdminClient();
  const db = admin ?? supabase;

  const { data: byInvite } = await db
    .from("companies")
    .select("id, name, slug, invite_email, claimed")
    .eq("invite_email", email)
    .eq("claimed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byInvite?.id) {
    return {
      kind: "claim",
      companyId: byInvite.id as string,
      companyName: byInvite.name as string,
      companySlug: byInvite.slug as string,
      inviteEmail: email,
    };
  }

  const { data: owned } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .order("created_at", { ascending: true });

  if (owned && owned.length > 0) {
    const first = owned[0];
    return {
      kind: "owned",
      companyId: first.id as string,
      companyName: first.name as string,
      companySlug: first.slug as string,
      email,
    };
  }

  return { kind: "missing", email };
}

/**
 * Claim by company id after server re-loads claim_token.
 * Requires session email === invite_email. Never accepts a client token.
 */
export async function resolveClaimTokenForSession(
  companyId: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "Sign in required." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Claim is temporarily unavailable." };

  const { data: ghost } = await admin
    .from("companies")
    .select("id, claim_token, invite_email, claimed")
    .eq("id", companyId)
    .eq("claimed", false)
    .maybeSingle();

  if (!ghost?.claim_token || !ghost.invite_email) {
    return { ok: false, error: "Invalid or already claimed." };
  }

  const sessionEmail = user.email.trim().toLowerCase();
  const invite = String(ghost.invite_email).trim().toLowerCase();
  if (sessionEmail !== invite) {
    return {
      ok: false,
      error: "Sign in with the invite email to claim this company.",
    };
  }

  return { ok: true, token: ghost.claim_token as string };
}
