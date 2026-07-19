import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { createClient } from "@/lib/supabase/server";
import type { Partner } from "@/types/partner";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Accepted partnerships for a public company profile.
 * Firm appears as requester or recipient; join companies for the other side.
 */
export async function getPartnersForCompany(
  companyId: string,
): Promise<Partner[]> {
  if (!companyId) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partnerships")
      .select(
        `
        id,
        status,
        requester_id,
        recipient_id,
        requester:companies!requester_id(
          id, slug, name, category, city, verified, claimed, logo_url, website
        ),
        recipient:companies!recipient_id(
          id, slug, name, category, city, verified, claimed, logo_url, website
        )
      `,
      )
      .or(`requester_id.eq.${companyId},recipient_id.eq.${companyId}`)
      .eq("status", "accepted");

    if (error) {
      console.error("[getPartnersForCompany]", error.message);
      return [];
    }
    if (!data?.length) return [];

    const partners: Partner[] = [];
    const otherIds: string[] = [];

    for (const row of data) {
      const outgoing = row.requester_id === companyId;
      const otherRaw = outgoing ? row.recipient : row.requester;
      const other = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw;
      if (!other?.id || !other.slug) continue;
      otherIds.push(other.id as string);
      partners.push({
        id: other.id as string,
        slug: other.slug as string,
        name: other.name as string,
        category: (other.category as string) ?? "",
        city: (other.city as string) ?? "",
        verified: Boolean(other.verified) && other.claimed !== false,
        sharedProjects: 0,
        logoInitials: initials(other.name as string),
        logoUrl: companyDisplayLogoUrl({
          logoUrl: other.logo_url as string | null,
          website: other.website as string | null,
        }),
        status: "accepted",
      });
    }

    if (otherIds.length === 0) return [];

    const shared = new Map<string, number>();

    const { data: ownedCases } = await supabase
      .from("case_studies")
      .select("id")
      .eq("company_id", companyId);
    const ownedIds = (ownedCases ?? []).map((c) => c.id as string);

    if (ownedIds.length > 0) {
      const { data: outbound } = await supabase
        .from("case_study_partners")
        .select("partner_company_id")
        .eq("confirmed", true)
        .in("case_study_id", ownedIds)
        .in("partner_company_id", otherIds);
      for (const row of outbound ?? []) {
        const id = row.partner_company_id as string;
        shared.set(id, (shared.get(id) ?? 0) + 1);
      }
    }

    const { data: inboundLinks } = await supabase
      .from("case_study_partners")
      .select("case_study_id")
      .eq("confirmed", true)
      .eq("partner_company_id", companyId);
    const inboundCaseIds = [
      ...new Set((inboundLinks ?? []).map((r) => r.case_study_id as string)),
    ];
    if (inboundCaseIds.length > 0) {
      const { data: theirCases } = await supabase
        .from("case_studies")
        .select("id, company_id")
        .in("id", inboundCaseIds)
        .in("company_id", otherIds);
      for (const c of theirCases ?? []) {
        const id = c.company_id as string;
        shared.set(id, (shared.get(id) ?? 0) + 1);
      }
    }

    for (const p of partners) {
      p.sharedProjects = shared.get(p.id) ?? 0;
    }

    partners.sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      if (b.sharedProjects !== a.sharedProjects) {
        return b.sharedProjects - a.sharedProjects;
      }
      return a.name.localeCompare(b.name);
    });

    return partners;
  } catch (err) {
    console.error("[getPartnersForCompany]", err);
    return [];
  }
}
