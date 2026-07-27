"use server";

import {
  discoverEmailsOnWebsite,
  manualEntryLockDomain,
} from "@/features/verification/email-discovery";
import {
  allowDiscoveryAttempt,
  getEmailVerificationContext,
} from "@/features/verification/email-verification-context";
import { extractDomain } from "@/features/verification/domain";
import { getOwnedActiveCompany } from "@/features/workspace/require-owned";
import { getRequestIpHash } from "@/lib/request-ip";
import { createClient } from "@/lib/supabase/server";

export async function discoverVerificationEmails(input?: {
  claimToken?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Sign in to continue." };

  let companyId: string | null = null;
  let website = "";
  let roleOnly = false;

  if (input?.claimToken) {
    const { data: preview } = await supabase.rpc("get_claim_preview", {
      p_token: input.claimToken,
    });
    const row = preview?.[0];
    if (!row?.company_id || row.claimed) {
      return { ok: false as const, error: "Invalid claim link." };
    }
    companyId = row.company_id as string;
    const ctx = await getEmailVerificationContext(companyId, input.claimToken);
    if (!ctx) return { ok: false as const, error: "No website on file." };
    website = ctx.website;
    roleOnly = ctx.roleOnly;
  } else {
    const owned = await getOwnedActiveCompany();
    if (!owned.company) {
      return { ok: false as const, error: "No company selected." };
    }
    companyId = owned.company.id;
    website = owned.company.website ?? "";
    const ctx = await getEmailVerificationContext(companyId);
    roleOnly = ctx?.roleOnly ?? false;
  }

  const ipHash = await getRequestIpHash();
  const gate = await allowDiscoveryAttempt(
    supabase,
    companyId,
    ipHash,
    input?.claimToken,
  );
  if (gate !== true) return { ok: false as const, error: gate };

  const addresses = await discoverEmailsOnWebsite(website, roleOnly);
  const domain = extractDomain(website) ?? website;

  await supabase.rpc("log_domain_email_discovery", {
    p_company_id: companyId,
    p_ip_hash: ipHash,
    p_website_domain: domain,
    p_address_count: addresses.length,
  });

  return {
    ok: true as const,
    addresses,
    lockDomain: manualEntryLockDomain(website),
    roleOnly,
    websiteDomain: domain,
  };
}
