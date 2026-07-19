import { createClient } from "@/lib/supabase/server";
import type { CaseStudy, CaseStudyPartner } from "@/types/case-study";
import type { ClientConfirmationView } from "@/types/client-confirmation";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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

async function loadPartnersForCases(
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

/** Public profile list — all case studies for the company from DB. */
export async function getCaseStudiesForCompany(
  companyId: string,
): Promise<CaseStudy[]> {
  if (!companyId) return [];

  try {
    const supabase = await createClient();
    const { data: cases, error } = await supabase
      .from("case_studies")
      .select(
        "id, slug, title, summary, challenge, outcome, location, year, services",
      )
      .eq("company_id", companyId)
      .order("year", { ascending: false });

    if (error) {
      console.error("[getCaseStudiesForCompany]", error.message);
      return [];
    }
    if (!cases?.length) return [];

    const partnersByCase = await loadPartnersForCases(
      cases.map((c) => c.id as string),
    );

    return cases.map((c) => ({
      id: c.id as string,
      slug: c.slug as string,
      title: c.title as string,
      summary: (c.summary as string) ?? "",
      challenge: (c.challenge as string) ?? "",
      outcome: (c.outcome as string) ?? "",
      location: (c.location as string) ?? "",
      year: (c.year as string) ?? "",
      services: (c.services as string[]) ?? [],
      partners: partnersByCase.get(c.id as string) ?? [],
      clientConfirmation: null,
    }));
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
      .select(
        "id, slug, title, summary, challenge, outcome, location, year, services",
      )
      .eq("company_id", company.id)
      .eq("slug", caseSlug)
      .maybeSingle();

    if (error) {
      console.error("[getCaseStudyForPage]", error.message);
      return null;
    }
    if (!cs) return null;

    const partnersByCase = await loadPartnersForCases([cs.id as string]);
    const enriched: CaseStudy = {
      id: cs.id as string,
      slug: cs.slug as string,
      title: cs.title as string,
      summary: (cs.summary as string) ?? "",
      challenge: (cs.challenge as string) ?? "",
      outcome: (cs.outcome as string) ?? "",
      location: (cs.location as string) ?? "",
      year: (cs.year as string) ?? "",
      services: (cs.services as string[]) ?? [],
      partners: partnersByCase.get(cs.id as string) ?? [],
      clientConfirmation: null,
    };

    const { data: conf } = await supabase
      .from("case_study_client_confirmation_requests")
      .select(
        "id, status, email, token, confirmed_at, confirmed_by_company_id, confirmer:companies!confirmed_by_company_id(id, name, slug, logo_url)",
      )
      .eq("case_study_id", cs.id)
      .eq("status", "confirmed")
      .order("confirmed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const firmRaw = conf?.confirmer;
    const firm = Array.isArray(firmRaw) ? firmRaw[0] : firmRaw;

    if (conf?.status === "confirmed" && firm) {
      const confirmedFirm = firm as {
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
      };
      enriched.clientConfirmation = {
        id: conf.id,
        caseStudyId: cs.id as string,
        status: "confirmed",
        email: conf.email,
        token: conf.token,
        confirmedAt: conf.confirmed_at ?? undefined,
        confirmedBy: {
          id: confirmedFirm.id,
          name: confirmedFirm.name,
          slug: confirmedFirm.slug,
          logoUrl: confirmedFirm.logo_url,
          logoInitials: initials(confirmedFirm.name),
        },
      };
    }

    return enriched;
  } catch (err) {
    console.error("[getCaseStudyForPage]", err);
    return null;
  }
}

export async function isCompanyOwnerSlug(slug: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .eq("owner_id", user.id)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

export async function getViewerCompany() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, company: null };

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, slug, logo_url")
      .eq("owner_id", user.id)
      .maybeSingle();

    return { user, company };
  } catch {
    return { user: null, company: null };
  }
}
