import "server-only";

import { createClient } from "@/lib/supabase/server";

export type PendingCaseStudyConfirmation = {
  caseStudyId: string;
  title: string;
  slug: string;
  ownerSlug: string;
  ownerName: string;
  role: string;
};

/** Case studies where this company is tagged as a partner and hasn't confirmed yet. */
export async function getPendingCaseStudyConfirmations(
  companyId: string,
): Promise<PendingCaseStudyConfirmation[]> {
  if (!companyId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("case_study_partners")
      .select(
        "case_study_id, role, case_study:case_studies!case_study_id(title, slug, company:companies!company_id(slug, name))",
      )
      .eq("partner_company_id", companyId)
      .eq("confirmed", false);

    if (error || !data) return [];

    return data
      .map((row) => {
        const cs = Array.isArray(row.case_study)
          ? row.case_study[0]
          : row.case_study;
        const owner = cs?.company
          ? Array.isArray(cs.company)
            ? cs.company[0]
            : cs.company
          : null;
        if (!cs?.slug || !owner?.slug) return null;
        return {
          caseStudyId: row.case_study_id as string,
          title: cs.title as string,
          slug: cs.slug as string,
          ownerSlug: owner.slug as string,
          ownerName: owner.name as string,
          role: (row.role as string) ?? "",
        };
      })
      .filter(Boolean) as PendingCaseStudyConfirmation[];
  } catch {
    return [];
  }
}
