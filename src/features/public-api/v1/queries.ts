import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import {
  serializeAssessment,
  serializeCaseStudies,
  serializeCompany,
  serializeReferences,
  type PublicCaseStudyRow,
} from "@/features/public-api/v1/serializers";
import type {
  ApiCaseStudiesResponse,
  ApiCompanyResponse,
  ApiCompanyStats,
  ApiReferencesResponse,
} from "@/features/public-api/v1/types";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

async function loadConfirmedCaseStudies(
  companyId: string,
): Promise<PublicCaseStudyRow[]> {
  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("case_studies")
    .select("id, slug, title, summary, year, location")
    .eq("company_id", companyId)
    .order("year", { ascending: false })
    .limit(40);

  if (!cases?.length) return [];

  const ids = cases.map((c) => c.id as string);
  const [{ data: clientOk }, { data: partnerRows }] = await Promise.all([
    supabase
      .from("case_study_client_confirmation_requests")
      .select("case_study_id")
      .eq("status", "confirmed")
      .in("case_study_id", ids),
    supabase
      .from("case_study_partners")
      .select(
        "case_study_id, confirmed, partner:companies!partner_company_id(name, slug)",
      )
      .eq("confirmed", true)
      .in("case_study_id", ids),
  ]);

  const clientSet = new Set(
    (clientOk ?? []).map((r) => r.case_study_id as string),
  );

  const partnersByCase = new Map<string, { name: string; slug: string }[]>();
  for (const row of partnerRows ?? []) {
    const caseId = row.case_study_id as string;
    const partnerRaw = row.partner;
    const partner = Array.isArray(partnerRaw) ? partnerRaw[0] : partnerRaw;
    if (!partner?.slug || !partner?.name) continue;
    const list = partnersByCase.get(caseId) ?? [];
    list.push({ name: partner.name as string, slug: partner.slug as string });
    partnersByCase.set(caseId, list);
  }

  return cases
    .filter(
      (c) =>
        clientSet.has(c.id as string) ||
        (partnersByCase.get(c.id as string)?.length ?? 0) > 0,
    )
    .map((c) => ({
      slug: c.slug as string,
      title: c.title as string,
      summary: (c.summary as string) ?? "",
      year: (c.year as string) ?? "",
      location: (c.location as string) ?? "",
      clientConfirmed: clientSet.has(c.id as string),
      confirmedPartners: partnersByCase.get(c.id as string) ?? [],
    }))
    .slice(0, 20);
}

/** Public company document for API — confirmed stats only when claimed. */
export async function getPublicCompanyApi(
  slug: string,
): Promise<ApiCompanyResponse | null> {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}`;
  const claimed = company.claimed !== false;

  if (!claimed) {
    return serializeCompany({
      company,
      trustLevel: "Member",
      stats: null,
      assessment: null,
      profileUrl,
    });
  }

  const [trust, assessmentSummary] = await Promise.all([
    getTrustProfile(company.id, company.slug),
    getClientAssessmentSummary(company.id),
  ]);

  const confirmedCaseStudies =
    trust.breakdown.clientConfirmedCaseStudies +
    trust.breakdown.partnerConfirmedCaseStudies;

  const stats: ApiCompanyStats = {
    confirmed_partners: trust.breakdown.confirmedPartners,
    confirmed_references: trust.breakdown.confirmedReferences,
    ongoing_references: trust.breakdown.ongoingReferences,
    confirmed_case_studies: confirmedCaseStudies,
  };

  return serializeCompany({
    company,
    trustLevel: trust.level,
    stats,
    assessment: serializeAssessment(assessmentSummary),
    profileUrl,
  });
}

export async function getPublicReferencesApi(
  slug: string,
): Promise<ApiReferencesResponse | null> {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  if (company.claimed === false) {
    return { references: [], count: 0 };
  }

  const all = await getReferencesForCompany(company.id);
  const confirmed = all
    .filter((r) => r.status === "confirmed")
    .sort((a, b) => {
      if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1;
      return (a.startedYear || "9999").localeCompare(b.startedYear || "9999");
    });

  return serializeReferences(confirmed);
}

export async function getPublicCaseStudiesApi(
  slug: string,
): Promise<ApiCaseStudiesResponse | null> {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  const siteUrl = getSiteUrl();
  if (company.claimed === false) {
    return { case_studies: [], count: 0 };
  }

  const rows = await loadConfirmedCaseStudies(company.id);
  return serializeCaseStudies(
    rows,
    (caseSlug) => `${siteUrl}/c/${company.slug}/case-studies/${caseSlug}`,
  );
}
