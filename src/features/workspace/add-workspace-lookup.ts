import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AddWorkspaceLookup =
  | {
      kind: "claim";
      companyId: string;
      companyName: string;
      companySlug: string;
      claimToken: string;
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

function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  if (!domain || domain.includes(" ")) return null;
  // Skip common free mail for domain→company match
  if (
    /^(gmail|googlemail|outlook|hotmail|live|yahoo|icloud|me|aol|proton|protonmail)\./.test(
      domain,
    ) ||
    ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"].includes(
      domain,
    )
  ) {
    return null;
  }
  return domain;
}

/** Find claimable draft or existing owned workspace by invite email / domain. */
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

  const admin = createAdminClient();
  const db = admin ?? supabase;

  const { data: byInvite } = await db
    .from("companies")
    .select("id, name, slug, claim_token, invite_email, claimed")
    .eq("invite_email", email)
    .eq("claimed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byInvite?.claim_token) {
    return {
      kind: "claim",
      companyId: byInvite.id as string,
      companyName: byInvite.name as string,
      companySlug: byInvite.slug as string,
      claimToken: byInvite.claim_token as string,
      inviteEmail: email,
    };
  }

  const domain = emailDomain(email);
  if (domain) {
    const { data: byDomain } = await db
      .from("companies")
      .select("id, name, slug, claim_token, invite_email, claimed, website")
      .eq("claimed", false)
      .not("claim_token", "is", null)
      .ilike("website", `%${domain}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byDomain?.claim_token) {
      return {
        kind: "claim",
        companyId: byDomain.id as string,
        companyName: byDomain.name as string,
        companySlug: byDomain.slug as string,
        claimToken: byDomain.claim_token as string,
        inviteEmail: email,
      };
    }
  }

  // Already-owned claimed company for this user matching email domain name — rare
  const { data: owned } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .order("created_at", { ascending: true });

  if (owned && owned.length > 0 && user.email?.toLowerCase() === email) {
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
