import { createClient } from "@/lib/supabase/server";
import {
  CASE_STUDY_SELECT,
  mapCaseStudyRow,
} from "@/lib/case-study-row";
import { loadClientConfirmationsForCases } from "@/features/case-studies/load-client-confirmations";
import { loadPartnersForCases } from "@/features/case-studies/load-partners";
import type { CaseStudy } from "@/types/case-study";
import type { ClientConfirmationView } from "@/types/client-confirmation";

export { getViewerCompany, isCompanyOwnerSlug } from "@/features/case-studies/viewer";

export async function getClientConfirmationByToken(token: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_client_confirmation_by_token", {
      p_token: token,
    });

    if (error || !data?.[0]) return null;
    const row = data[0];

    return {
      id: row.id,
      caseStudyId: row.case_study_id,
      requestedByCompanyId: row.requested_by_company_id,
      email: row.email,
      token: row.token,
      status: row.status,
      confirmedByCompanyId: row.confirmed_by_company_id,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
      caseTitle: row.case_title,
      caseSlug: row.case_slug,
      caseSummary: row.case_summary,
      caseYear: row.case_year,
      caseLocation: row.case_location,
      requesterName: row.requester_name,
      requesterSlug: row.requester_slug,
      confirmerName: row.confirmer_name,
      confirmerSlug: row.confirmer_slug,
      confirmerLogoUrl: row.confirmer_logo_url,
    } satisfies ClientConfirmationView;
  } catch (err) {
    console.error("[getClientConfirmationByToken]", err);
    return null;
  }
}

/** Public profile list — all case studies for the company from DB. */
export async function getCaseStudiesForCompany(
  companyId: string,
): Promise<CaseStudy[]> {
  if (!companyId) return [];

  try {
    const supabase = await createClient();
    const { data: cases, error } = await supabase
      .from("case_studies")
      .select(CASE_STUDY_SELECT)
      .eq("company_id", companyId)
      .order("year", { ascending: false });

    if (error) {
      console.error("[getCaseStudiesForCompany]", error.message);
      return [];
    }
    if (!cases?.length) return [];

    const ids = cases.map((c) => c.id as string);
    const [partnersByCase, confirmByCase] = await Promise.all([
      loadPartnersForCases(ids),
      loadClientConfirmationsForCases(ids),
    ]);

    return cases.map((c) =>
      mapCaseStudyRow(
        c,
        partnersByCase.get(c.id as string) ?? [],
        confirmByCase.get(c.id as string) ?? null,
      ),
    );
  } catch (err) {
    console.error("[getCaseStudiesForCompany]", err);
    return [];
  }
}

export async function getCaseStudyForPage(
  companySlug: string,
  caseSlug: string,
): Promise<CaseStudy | null> {
  if (!companySlug || !caseSlug) return null;

  try {
    const supabase = await createClient();
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", companySlug)
      .maybeSingle();

    if (companyError) {
      console.error("[getCaseStudyForPage]", companyError.message);
      return null;
    }
    if (!company) return null;

    const { data: cs, error } = await supabase
      .from("case_studies")
      .select(CASE_STUDY_SELECT)
      .eq("company_id", company.id)
      .eq("slug", caseSlug)
      .maybeSingle();

    if (error) {
      console.error("[getCaseStudyForPage]", error.message);
      return null;
    }
    if (!cs) return null;

    const [partnersByCase, confirmByCase] = await Promise.all([
      loadPartnersForCases([cs.id as string]),
      loadClientConfirmationsForCases([cs.id as string]),
    ]);

    return mapCaseStudyRow(
      cs,
      partnersByCase.get(cs.id as string) ?? [],
      confirmByCase.get(cs.id as string) ?? null,
    );
  } catch (err) {
    console.error("[getCaseStudyForPage]", err);
    return null;
  }
}

export async function getCaseStudyForDashboard(
  companyId: string,
  caseSlug: string,
): Promise<CaseStudy | null> {
  if (!companyId || !caseSlug) return null;

  try {
    const supabase = await createClient();
    const { data: cs, error } = await supabase
      .from("case_studies")
      .select(CASE_STUDY_SELECT)
      .eq("company_id", companyId)
      .eq("slug", caseSlug)
      .maybeSingle();

    if (error || !cs) return null;

    const [partnersByCase, confirmByCase] = await Promise.all([
      loadPartnersForCases([cs.id as string]),
      loadClientConfirmationsForCases([cs.id as string]),
    ]);

    return mapCaseStudyRow(
      cs,
      partnersByCase.get(cs.id as string) ?? [],
      confirmByCase.get(cs.id as string) ?? null,
    );
  } catch {
    return null;
  }
}
