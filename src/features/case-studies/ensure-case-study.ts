import type { SupabaseClient } from "@supabase/supabase-js";
import { getCaseStudy } from "@/data/mock/case-studies";
import { getCompanyBySlug } from "@/data/mock/companies";

/** Upsert mock case study into Supabase so confirmation can attach to a real row. */
export async function ensureCaseStudyRow(
  supabase: SupabaseClient,
  companyId: string,
  companySlug: string,
  caseSlug: string,
) {
  const existing = await supabase
    .from("case_studies")
    .select("id")
    .eq("company_id", companyId)
    .eq("slug", caseSlug)
    .maybeSingle();

  if (existing.data?.id) return existing.data.id;

  const mock = getCaseStudy(companySlug, caseSlug);
  if (!mock) return null;

  const { data, error } = await supabase
    .from("case_studies")
    .insert({
      company_id: companyId,
      title: mock.title,
      slug: mock.slug,
      summary: mock.summary,
      challenge: mock.challenge,
      outcome: mock.outcome,
      location: mock.location,
      year: mock.year,
      services: mock.services,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[ensureCaseStudyRow]", error?.message);
    return null;
  }

  for (const partner of mock.partners) {
    const partnerCompany = getCompanyBySlug(partner.slug);
    if (!partnerCompany) continue;

    const { data: partnerRow } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", partner.slug)
      .maybeSingle();

    if (!partnerRow?.id) continue;

    await supabase.from("case_study_partners").upsert({
      case_study_id: data.id,
      partner_company_id: partnerRow.id,
      role: partner.role,
      confirmed: partner.confirmed,
      confirmed_at: partner.confirmed ? new Date().toISOString() : null,
    });
  }

  return data.id as string;
}
