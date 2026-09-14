import "server-only";

import { listSharedCases, type SharedCase } from "@/features/certificate/shared-cases";
import { getCompanyForPage } from "@/features/companies/queries";
import { createPublicClient } from "@/lib/supabase/public";
import type { Company } from "@/types/company";

export type CertificateParty = {
  slug: string;
  name: string;
  category: string;
  city: string;
  country: string;
  website: string;
  verified: boolean;
  logoUrl: string | null;
  logoInitials: string;
  services: string[];
};

export type PartnershipCertificate = {
  left: CertificateParty;
  right: CertificateParty;
  confirmedAt: string;
  sharedCases: number;
  sharedCaseList: SharedCase[];
};

function asParty(company: Company): CertificateParty {
  return {
    slug: company.slug,
    name: company.name,
    category: company.category,
    city: company.city,
    country: company.country,
    website: company.website,
    verified: company.verified,
    logoUrl: company.logoUrl ?? null,
    logoInitials: company.logoInitials,
    services: company.services ?? [],
  };
}

/** Accepted partnership only — pending records never appear. */
export async function getPartnershipCertificate(
  leftSlug: string,
  rightSlug: string,
): Promise<PartnershipCertificate | null> {
  if (!leftSlug || !rightSlug || leftSlug === rightSlug) return null;

  const [leftCompany, rightCompany] = await Promise.all([
    getCompanyForPage(leftSlug),
    getCompanyForPage(rightSlug),
  ]);
  if (!leftCompany || !rightCompany) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("partnerships")
    .select("responded_at, created_at")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${leftCompany.id},recipient_id.eq.${rightCompany.id}),and(requester_id.eq.${rightCompany.id},recipient_id.eq.${leftCompany.id})`,
    )
    .maybeSingle();

  if (error || !data) return null;

  const confirmedAt =
    (data.responded_at as string | null) || (data.created_at as string);
  const sharedCaseList = await listSharedCases(
    leftCompany.id,
    rightCompany.id,
    leftCompany.slug,
    rightCompany.slug,
  );

  return {
    left: asParty(leftCompany),
    right: asParty(rightCompany),
    confirmedAt,
    sharedCases: sharedCaseList.length,
    sharedCaseList,
  };
}
