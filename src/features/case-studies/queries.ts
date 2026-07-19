import { getCaseStudy as getMockCaseStudy } from "@/data/mock/case-studies";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudy } from "@/types/case-study";
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
  } catch {
    return null;
  }
}

export async function getCaseStudyForPage(companySlug: string, caseSlug: string) {
  const mock = getMockCaseStudy(companySlug, caseSlug);
  if (!mock) return null;

  const enriched: CaseStudy = { ...mock, clientConfirmation: null };

  try {
    const supabase = await createClient();
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", companySlug)
      .maybeSingle();

    if (!company) return enriched;

    const { data: cs } = await supabase
      .from("case_studies")
      .select("id")
      .eq("company_id", company.id)
      .eq("slug", caseSlug)
      .maybeSingle();

    if (!cs) return enriched;

    enriched.id = cs.id;

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
        caseStudyId: cs.id,
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
  } catch {
    return enriched;
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
