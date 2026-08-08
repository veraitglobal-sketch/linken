import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import {
  serializeAssessment,
  serializeCaseStudies,
  serializeCompany,
  serializeReferences,
  serializeTestimonials,
  type PublicCaseStudyRow,
} from "@/features/public-api/v1/serializers";
import type {
  ApiCaseStudiesResponse,
  ApiCompanyResponse,
  ApiCompanyStats,
  ApiPartnersResponse,
  ApiReferencesResponse,
  ApiTestimonialsResponse,
  ApiVerifyResponse,
} from "@/features/public-api/v1/types";
import {
  getPublishedTestimonials,
  toPublicTestimonials,
} from "@/features/testimonials/queries";
import { getPartnersForCompany } from "@/features/partners/public-queries";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { extractDomain } from "@/features/verification/domain";
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

export async function getPublicPartnersApi(
  slug: string,
): Promise<ApiPartnersResponse | null> {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  if (company.claimed === false) {
    return { partners: [], count: 0 };
  }

  const partners = await getPartnersForCompany(company.id);
  const rows = partners.map((p) => ({
    name: p.name,
    slug: p.slug,
    verified: Boolean(p.verified),
  }));
  return { partners: rows, count: rows.length };
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

/**
 * Full published set for LLM markdown / evidence — not studio-curated.
 * Host sites use getPublicTestimonialsForSites (order / exclude / limit).
 */
export async function getPublicTestimonialsApi(
  slug: string,
): Promise<ApiTestimonialsResponse | null> {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  if (company.claimed === false) {
    return { testimonials: [], count: 0 };
  }

  const supabase = await createClient();
  const rows = await getPublishedTestimonials(company.id, supabase);
  const publicRows = await toPublicTestimonials(rows, company.slug, supabase);
  return serializeTestimonials(publicRows);
}

/**
 * Trust oracle: resolve a claimed company by website domain (exact / www-normalized).
 * Confirmed-evidence fields only — never tokens or private columns.
 */
export async function getPublicVerifyByDomain(
  domainInput: string,
): Promise<ApiVerifyResponse> {
  const generated_at = new Date().toISOString();
  const empty: ApiVerifyResponse = {
    found: false,
    company: null,
    verified: false,
    verification_method: null,
    verified_since: null,
    trust_level: null,
    stats: null,
    assessment: null,
    llm_md_url: null,
    api_url: null,
    generated_at,
  };

  const domain = extractDomain(domainInput);
  if (!domain) return empty;

  const supabase = await createClient();
  // Broad candidates — extractDomain equality is the source of truth (www stripped).
  const { data: rows, error } = await supabase
    .from("companies")
    .select("id, slug, name, website, verified, claimed")
    .eq("claimed", true)
    .not("website", "eq", "")
    .or(
      `website.ilike.%${domain}%,website.ilike.%www.${domain}%`,
    )
    .limit(40);

  if (error) {
    console.error("[getPublicVerifyByDomain]", error.message);
    return empty;
  }

  const hit = (rows ?? []).find((row) => {
    const d = extractDomain((row.website as string) ?? "");
    return d === domain;
  });

  if (!hit) return empty;

  const siteUrl = getSiteUrl();
  const slug = hit.slug as string;
  const api = await getPublicCompanyApi(slug);
  if (!api) return empty;

  const { data: ver } = await supabase
    .from("company_verifications")
    .select("verification_method, verified_at")
    .eq("company_id", hit.id)
    .maybeSingle();

  const method = ver?.verification_method as
    | "email_domain"
    | "dns_txt"
    | "meta_tag"
    | null;

  return {
    found: true,
    company: {
      name: api.name,
      slug: api.slug,
      profile_url: api.profile_url,
    },
    verified: api.verified,
    verification_method: api.verified ? method ?? null : null,
    verified_since: api.verified
      ? ((ver?.verified_at as string | null) ?? null)
      : null,
    trust_level: api.trust_level,
    stats: api.stats,
    assessment: api.assessment,
    llm_md_url: `${siteUrl}/c/${slug}/llm.md`,
    api_url: `${siteUrl}/api/v1/companies/${slug}`,
    generated_at,
  };
}
