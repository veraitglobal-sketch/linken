import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

export type SharedCase = {
  title: string;
  year: string;
  slug: string;
  ownerSlug: string;
};

export async function listSharedCases(
  leftId: string,
  rightId: string,
  leftSlug: string,
  rightSlug: string,
): Promise<SharedCase[]> {
  const supabase = createPublicClient();
  const [outbound, inbound] = await Promise.all([
    supabase
      .from("case_study_partners")
      .select("case_study_id, case_studies!inner(id, title, year, slug, company_id)")
      .eq("confirmed", true)
      .eq("partner_company_id", rightId)
      .eq("case_studies.company_id", leftId),
    supabase
      .from("case_study_partners")
      .select("case_study_id, case_studies!inner(id, title, year, slug, company_id)")
      .eq("confirmed", true)
      .eq("partner_company_id", leftId)
      .eq("case_studies.company_id", rightId),
  ]);

  const slugFor = (companyId: string) =>
    companyId === leftId ? leftSlug : rightSlug;
  const seen = new Set<string>();
  const out: SharedCase[] = [];

  for (const pack of [outbound.data ?? [], inbound.data ?? []]) {
    for (const row of pack) {
      const raw = row.case_studies as
        | {
            id: string;
            title: string;
            year: string | null;
            slug: string;
            company_id: string;
          }
        | {
            id: string;
            title: string;
            year: string | null;
            slug: string;
            company_id: string;
          }[]
        | null;
      const cs = Array.isArray(raw) ? raw[0] : raw;
      if (!cs?.id || seen.has(cs.id)) continue;
      seen.add(cs.id);
      out.push({
        title: cs.title,
        year: cs.year ?? "",
        slug: cs.slug,
        ownerSlug: slugFor(cs.company_id),
      });
    }
  }
  return out.slice(0, 6);
}
