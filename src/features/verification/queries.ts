import { createClient } from "@/lib/supabase/server";

export type CompanyVerification = {
  companyId: string;
  verified: boolean;
  method: "email_domain" | "dns_txt" | "meta_tag" | null;
  verifiedAt: string | null;
  websiteLinked: boolean;
  websiteLinkedAt: string | null;
  lastCheck: string | null;
};

export async function getCompanyVerification(
  companyId: string,
): Promise<CompanyVerification | null> {
  if (!companyId || companyId.length < 20) return null;

  try {
    const supabase = await createClient();
    const [{ data: company }, { data: row }] = await Promise.all([
      supabase
        .from("companies")
        .select("id, verified")
        .eq("id", companyId)
        .maybeSingle(),
      supabase
        .from("company_verifications")
        .select(
          "company_id, verification_method, verified_at, website_linked, website_linked_at, last_verification_check",
        )
        .eq("company_id", companyId)
        .maybeSingle(),
    ]);

    if (!company) return null;

    return {
      companyId: company.id,
      verified: Boolean(company.verified),
      method: (row?.verification_method as CompanyVerification["method"]) ?? null,
      verifiedAt: row?.verified_at ?? null,
      websiteLinked: Boolean(row?.website_linked),
      websiteLinkedAt: row?.website_linked_at ?? null,
      lastCheck: row?.last_verification_check ?? null,
    };
  } catch {
    return null;
  }
}

/** Public verification summary for profile display — never includes token. */
export async function getPublicVerification(companyId: string) {
  return getCompanyVerification(companyId);
}
