import { STRENGTH_LABELS } from "@/features/assessments/catalog";
import type { ClientAssessmentSummary } from "@/features/assessments/queries";
import type { PublicTestimonial } from "@/features/testimonials/types";
import type {
  ApiAssessment,
  ApiCaseStudiesResponse,
  ApiCaseStudy,
  ApiCompanyResponse,
  ApiCompanyStats,
  ApiReference,
  ApiReferencesResponse,
  ApiTestimonial,
  ApiTestimonialsResponse,
  ApiTrustLevel,
} from "@/features/public-api/v1/types";
import type { TrustLevel } from "@/features/trust/score";
import type { Company } from "@/types/company";
import type { ServiceReference } from "@/types/service-reference";
import { publicReferenceClient } from "@/features/confirmations/public-client";

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
  const view = publicReferenceClient(ref);
  return {
    client_name: view.clientName,
    client_slug: view.clientSlug,
    service: view.service,
    started_year: view.startedYear ?? "",
    ongoing: Boolean(view.ongoing),
    ended_year: view.endedYear,
    confirmed_at: view.confirmedAt ?? "",
    confirmation_level: view.confirmationLevel ?? 1,
    disclosure: view.disclosure === "undisclosed" ? "undisclosed" : "named",
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

export function serializeTestimonial(row: PublicTestimonial): ApiTestimonial {
  return {
    id: row.id,
    body: row.body,
    author_name: row.authorName,
    author_role: row.authorRole,
    author_company: row.authorCompany
      ? { name: row.authorCompany.name, slug: row.authorCompany.slug }
      : null,
    source: row.source,
    published_at: row.publishedAt,
    profile_url: row.profileUrl,
  };
}

export function serializeTestimonials(
  rows: PublicTestimonial[],
): ApiTestimonialsResponse {
  const testimonials = rows.map(serializeTestimonial).slice(0, 50);
  return { testimonials, count: testimonials.length };
}
