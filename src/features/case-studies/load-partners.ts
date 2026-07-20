import type { CaseStudyPartner } from "@/types/case-study";
import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function loadPartnersForCases(
  caseIds: string[],
): Promise<Map<string, CaseStudyPartner[]>> {
  const map = new Map<string, CaseStudyPartner[]>();
  if (caseIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_study_partners")
    .select(
      "case_study_id, role, confirmed, partner:companies!partner_company_id(slug, name)",
    )
    .in("case_study_id", caseIds);

  if (error) {
    console.error("[loadPartnersForCases]", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const caseId = row.case_study_id as string;
    const partnerRaw = row.partner;
    const partner = Array.isArray(partnerRaw) ? partnerRaw[0] : partnerRaw;
    if (!partner?.slug || !partner?.name) continue;
    const list = map.get(caseId) ?? [];
    list.push({
      slug: partner.slug as string,
      name: partner.name as string,
      role: (row.role as string) ?? "",
      logoInitials: initials(partner.name as string),
      confirmed: Boolean(row.confirmed),
    });
    map.set(caseId, list);
  }
  return map;
}
