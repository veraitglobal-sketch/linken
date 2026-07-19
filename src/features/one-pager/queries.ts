import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { getReferencesForCompany } from "@/features/references/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/types/company";
import type { ServiceReference } from "@/types/service-reference";
import type { TrustLevel } from "@/features/trust/score";
import type { ClientAssessmentSummary } from "@/features/assessments/queries";

export type OnePagerCase = {
  title: string;
  year: string;
  summary: string;
};

export type OnePagerData = {
  company: Company;
  trustLevel: TrustLevel;
  confirmedPartners: number;
  confirmedReferences: number;
  ongoingReferences: number;
  assessment: ClientAssessmentSummary;
  references: ServiceReference[];
  caseStudies: OnePagerCase[];
};

async function getConfirmedCaseStudies(
  companyId: string,
): Promise<OnePagerCase[]> {
  try {
    const supabase = await createClient();
    const { data: cases } = await supabase
      .from("case_studies")
      .select("id, title, year, summary")
      .eq("company_id", companyId)
      .order("year", { ascending: false })
      .limit(20);

    if (!cases?.length) return [];

    const ids = cases.map((c) => c.id);
    const [{ data: clientOk }, { data: partnerOk }] = await Promise.all([
      supabase
        .from("case_study_client_confirmation_requests")
        .select("case_study_id")
        .eq("status", "confirmed")
        .in("case_study_id", ids),
      supabase
        .from("case_study_partners")
        .select("case_study_id")
        .eq("confirmed", true)
        .in("case_study_id", ids),
    ]);

    const confirmed = new Set<string>([
      ...(clientOk ?? []).map((r) => r.case_study_id as string),
      ...(partnerOk ?? []).map((r) => r.case_study_id as string),
    ]);

    return cases
      .filter((c) => confirmed.has(c.id))
      .slice(0, 3)
      .map((c) => ({
        title: c.title,
        year: c.year ?? "",
        summary: (c.summary ?? "").trim().slice(0, 180),
      }));
  } catch {
    return [];
  }
}

/** Confirmed-only payload for the verified one-pager. */
export async function getOnePagerData(
  slug: string,
): Promise<OnePagerData | null> {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  const [trust, assessment, allRefs, caseStudies] = await Promise.all([
    getTrustProfile(company.id, company.slug),
    getClientAssessmentSummary(company.id),
    getReferencesForCompany(company.id),
    getConfirmedCaseStudies(company.id),
  ]);

  const confirmed = allRefs.filter((r) => r.status === "confirmed");
  const references = confirmed
    .slice()
    .sort((a, b) => {
      if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1;
      return (a.startedYear || "9999").localeCompare(b.startedYear || "9999");
    })
    .slice(0, 8);

  return {
    company,
    trustLevel: trust.level,
    confirmedPartners: trust.breakdown.confirmedPartners,
    confirmedReferences: trust.breakdown.confirmedReferences,
    ongoingReferences: trust.breakdown.ongoingReferences,
    assessment,
    references,
    caseStudies,
  };
}
