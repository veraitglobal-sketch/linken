import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminVerificationRow = {
  companyId: string;
  companyName: string;
  companySlug: string;
  companyVerified: boolean;
  method: string | null;
  verifiedAt: string | null;
  lastCheck: string | null;
  websiteLinked: boolean;
  stale: boolean;
};

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function isStale(verifiedAt: string | null, lastCheck: string | null): boolean {
  const cutoff = Date.now() - NINETY_DAYS_MS;
  const staleVerified = verifiedAt ? new Date(verifiedAt).getTime() < cutoff : false;
  const staleCheck = lastCheck ? new Date(lastCheck).getTime() < cutoff : false;
  return staleVerified || staleCheck;
}

/** Company verifications joined with company identity, most recently verified first. */
export async function listCompanyVerifications(
  limit = 200,
): Promise<AdminVerificationRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("company_verifications")
    .select(
      "company_id, verification_method, verified_at, last_verification_check, website_linked, companies!inner(name, slug, verified)",
    )
    .order("verified_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  return (data ?? []).map((r) => {
    const co = r.companies as { name?: string; slug?: string; verified?: boolean } | null;
    const verifiedAt = (r.verified_at as string | null) ?? null;
    const lastCheck = (r.last_verification_check as string | null) ?? null;
    return {
      companyId: r.company_id as string,
      companyName: co?.name ?? "—",
      companySlug: co?.slug ?? "",
      companyVerified: Boolean(co?.verified),
      method: (r.verification_method as string | null) ?? null,
      verifiedAt,
      lastCheck,
      websiteLinked: Boolean(r.website_linked),
      stale: isStale(verifiedAt, lastCheck),
    };
  });
}
