import { STRENGTH_LABELS } from "@/features/assessments/catalog";
import type { ClientAssessmentSummary } from "@/features/assessments/queries";
import type {
  ApiAssessment,
  ApiCaseStudiesResponse,
  ApiCaseStudy,
  ApiCompanyResponse,
  ApiCompanyStats,
  ApiReference,
  ApiReferencesResponse,
  ApiTrustLevel,
} from "@/features/public-api/v1/types";
import type { TrustLevel } from "@/features/trust/score";
import type { Company } from "@/types/company";
import type { ServiceReference } from "@/types/service-reference";

export function toApiTrustLevel(level: TrustLevel): ApiTrustLevel {
  return level.toLowerCase() as ApiTrustLevel;
}

export type PublicCaseStudyRow = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  location: string;
  clientConfirmed: boolean;
  confirmedPartners: { name: string; slug: string }[];
};

/** Build assessment payload — null until ≥3 would_work_again answers. */
export function serializeAssessment(
  summary: ClientAssessmentSummary,
): ApiAssessment | null {
  if (summary.wouldWorkAgainTotal < 3) return null;
  return {
    would_work_again_yes: summary.wouldWorkAgainYes,
    would_work_again_total: summary.wouldWorkAgainTotal,
    top_strengths: summary.topStrengths.slice(0, 5).map((s) => ({
      key: s.key,
      label: STRENGTH_LABELS[s.key] ?? s.label,
      count: s.count,
    })),
  };
}

export function serializeCompany(input: {
  company: Company;
  trustLevel: TrustLevel;
  stats: ApiCompanyStats | null;
  assessment: ApiAssessment | null;
  profileUrl: string;
  generatedAt?: string;
}): ApiCompanyResponse {
  const { company } = input;
  return {
    slug: company.slug,
    name: company.name,
    category: company.category ?? "",
    city: company.city ?? "",
    country: company.country ?? "",
    website: company.website ?? "",
    verified: Boolean(company.verified),
    claimed: company.claimed !== false,
    accepting_clients: company.acceptingClients !== false,
    trust_level: toApiTrustLevel(input.trustLevel),
    stats: input.stats,
    assessment: input.assessment,
    profile_url: input.profileUrl,
    generated_at: input.generatedAt ?? new Date().toISOString(),
  };
}

export function serializeReference(ref: ServiceReference): ApiReference | null {
  if (ref.status !== "confirmed") return null;
  return {
    client_name: ref.clientName,
    client_slug: ref.clientSlug,
    service: ref.service,
    started_year: ref.startedYear ?? "",
    ongoing: Boolean(ref.ongoing),
    ended_year: ref.endedYear,
    confirmed_at: ref.confirmedAt ?? "",
  };
}

export function serializeReferences(
  refs: ServiceReference[],
): ApiReferencesResponse {
  const references = refs
    .map(serializeReference)
    .filter((r): r is ApiReference => r !== null)
    .slice(0, 50);
  return { references, count: references.length };
}

export function serializeCaseStudy(
  row: PublicCaseStudyRow,
  url: string,
): ApiCaseStudy {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    year: row.year,
    location: row.location,
    url,
    client_confirmed: row.clientConfirmed,
    confirmed_partners: row.confirmedPartners,
  };
}

export function serializeCaseStudies(
  rows: PublicCaseStudyRow[],
  urlFor: (slug: string) => string,
): ApiCaseStudiesResponse {
  const case_studies = rows
    .slice(0, 20)
    .map((row) => serializeCaseStudy(row, urlFor(row.slug)));
  return { case_studies, count: case_studies.length };
}
