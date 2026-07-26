import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { extractDomain } from "@/features/verification/domain";
import { initialsFromName } from "@/features/team/types";

export type PostConfirmKind = "case" | "reference";

export type PostConfirmSubject = {
  kind: PostConfirmKind;
  token: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  website: string | null;
  domain: string | null;
  logoUrl: string | null;
  logoInitials: string;
  claimed: boolean;
  claimToken: string | null;
  requesterName: string;
  requesterSlug: string;
  /** Where the confirmation is visible publicly. */
  visibilityHref: string;
  visibilityLabel: string;
};

/** Load confirmer company for the post-confirm screen (no sync crawl). */
export async function loadPostConfirmSubject(
  kind: PostConfirmKind,
  token: string,
  fallback: {
    requesterName: string;
    requesterSlug: string;
    caseSlug?: string;
    companyId?: string | null;
    companyName?: string | null;
    companySlug?: string | null;
  },
): Promise<PostConfirmSubject | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  let companyId: string | null = fallback.companyId ?? null;
  let requesterName = fallback.requesterName;
  let requesterSlug = fallback.requesterSlug;
  let visibilityHref = `/c/${requesterSlug}`;
  let visibilityLabel = `${requesterName} on Hansala`;

  if (kind === "case") {
    const { data } = await admin
      .from("case_study_client_confirmation_requests")
      .select(
        "status, confirmed_by_company_id, token, case_study_id, requested_by_company_id",
      )
      .eq("token", token)
      .maybeSingle();
    if (!data || data.status !== "confirmed") return null;
    companyId = (data.confirmed_by_company_id as string | null) ?? companyId;
    if (fallback.caseSlug) {
      visibilityHref = `/c/${requesterSlug}/case-studies/${fallback.caseSlug}`;
      visibilityLabel = "this project on Hansala";
    }
  } else {
    const { data } = await admin
      .from("service_references")
      .select(
        "status, client_company_id, confirm_token, provider_company_id, provider:companies!provider_company_id(name, slug)",
      )
      .eq("confirm_token", token)
      .maybeSingle();
    if (!data || data.status !== "confirmed") return null;
    companyId = (data.client_company_id as string | null) ?? companyId;
    const provider = Array.isArray(data.provider)
      ? data.provider[0]
      : data.provider;
    if (provider?.slug) {
      requesterSlug = provider.slug as string;
      requesterName = (provider.name as string) || requesterName;
      visibilityHref = `/c/${requesterSlug}`;
      visibilityLabel = `${requesterName}'s profile`;
    }
  }

  if (!companyId) return null;

  const { data: company } = await admin
    .from("companies")
    .select(
      "id, name, slug, website, logo_url, logo_source, claimed, claim_token",
    )
    .eq("id", companyId)
    .maybeSingle();

  if (!company) return null;

  const website = (company.website as string | null) ?? null;
  const domain = extractDomain(website ?? "") || null;
  // No sync crawl — stored mark only; missing → initials in the UI.
  const logoUrl = ((company.logo_url as string | null) ?? "").trim() || null;

  return {
    kind,
    token,
    companyId: company.id as string,
    companyName:
      (company.name as string) ||
      fallback.companyName ||
      "Your company",
    companySlug: (company.slug as string) || fallback.companySlug || "",
    website,
    domain,
    logoUrl,
    logoInitials: initialsFromName(
      (company.name as string) || fallback.companyName || "Co",
    ),
    claimed: company.claimed !== false,
    claimToken:
      company.claimed === false
        ? ((company.claim_token as string | null) ?? null)
        : null,
    requesterName,
    requesterSlug,
    visibilityHref,
    visibilityLabel,
  };
}
