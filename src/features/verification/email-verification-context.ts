import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type EmailVerificationContext = {
  roleOnly: boolean;
  website: string;
  lockDomain: string | null;
};

/** Role addresses only when claiming a pre-existing draft profile. */
export async function getEmailVerificationContext(
  companyId: string,
  claimToken?: string | null,
): Promise<EmailVerificationContext | null> {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("website, created_by_company_id, claimed, claim_token")
    .eq("id", companyId)
    .maybeSingle();

  if (!company?.website) return null;

  const claimingViaToken =
    Boolean(claimToken) &&
    company.claimed === false &&
    company.claim_token === claimToken;

  const roleOnly =
    company.created_by_company_id != null || claimingViaToken;

  const { lockDomainForWebsite } = await import(
    "@/features/verification/domain-allowed"
  );

  return {
    roleOnly,
    website: company.website,
    lockDomain: lockDomainForWebsite(company.website),
  };
}

export async function allowDiscoveryAttempt(
  supabase: SupabaseClient,
  companyId: string,
  ipHash: string | null,
  claimToken?: string | null,
): Promise<true | string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Sign in to continue.";

  const { data: allowed, error } = await supabase.rpc(
    "allow_domain_email_discovery",
    {
      p_company_id: companyId,
      p_ip_hash: ipHash,
      p_claim_token: claimToken ?? null,
    },
  );

  if (error) return error.message;
  if (allowed === false) {
    return "Rate limit: too many discovery attempts. Try again later.";
  }
  return true;
}
