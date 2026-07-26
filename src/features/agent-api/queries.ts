import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AgentAuditRow,
  AgentCaseStudy,
  AgentCompanyResponse,
  AgentInquiry,
  AgentPartnership,
  AgentReference,
} from "@/features/agent-api/types";
import { computeTrustScore } from "@/features/trust/score";

/** Every query MUST filter by companyId from the API key — service role bypasses RLS. */

export async function getAgentCompany(
  admin: SupabaseClient,
  companyId: string,
): Promise<AgentCompanyResponse | null> {
  const { data: company } = await admin
    .from("companies")
    .select(
      "id, slug, name, tagline, description, category, city, country, website, logo_url, cover_image_url, linkedin_url, facebook_url, services, verified, accepting_clients, claimed",
    )
    .eq("id", companyId)
    .maybeSingle();

  if (!company) return null;

  const { data: ver } = await admin
    .from("company_verifications")
    .select("website_linked, verified_at")
    .eq("company_id", companyId)
    .maybeSingle();

  const trust = await computeTrustForCompany(admin, companyId);
  const verifiedAt = (ver?.verified_at as string | null) ?? null;

  return {
    id: company.id as string,
    slug: company.slug as string,
    name: company.name as string,
    tagline: (company.tagline as string) ?? "",
    description: (company.description as string) ?? "",
    category: (company.category as string) ?? "",
    city: (company.city as string) ?? "",
    country: (company.country as string) ?? "",
    website: (company.website as string) ?? "",
    logo_url: (company.logo_url as string | null) ?? null,
    cover_image_url: (company.cover_image_url as string | null) ?? null,
    linkedin_url: (company.linkedin_url as string | null) ?? null,
    facebook_url: (company.facebook_url as string | null) ?? null,
    services: (company.services as string[]) ?? [],
    verified: Boolean(company.verified),
    verified_at: verifiedAt,
    website_linked: Boolean(ver?.website_linked),
    accepting_clients: company.accepting_clients !== false,
    claimed: company.claimed !== false,
    trust: {
      level: trust.level.toLowerCase(),
      points: trust.points,
      breakdown: {
        confirmed_partners: trust.breakdown.confirmedPartners,
        confirmed_references: trust.breakdown.confirmedReferences,
        ongoing_references: trust.breakdown.ongoingReferences,
        client_confirmed_case_studies:
          trust.breakdown.clientConfirmedCaseStudies,
        partner_confirmed_case_studies:
          trust.breakdown.partnerConfirmedCaseStudies,
      },
    },
    verification: {
      verified: Boolean(company.verified),
      verified_at: verifiedAt,
      website_linked: Boolean(ver?.website_linked),
    },
  };
}

async function computeTrustForCompany(
  admin: SupabaseClient,
  companyId: string,
) {
  const [partnersAsRequester, partnersAsRecipient, endedRefs, ongoingRefs, caseRows] =
    await Promise.all([
      admin
        .from("partnerships")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted")
        .eq("requester_id", companyId),
      admin
        .from("partnerships")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted")
        .eq("recipient_id", companyId),
      admin
        .from("service_references")
        .select("id", { count: "exact", head: true })
        .eq("provider_company_id", companyId)
        .eq("status", "confirmed")
        .eq("ongoing", false),
      admin
        .from("service_references")
        .select("id", { count: "exact", head: true })
        .eq("provider_company_id", companyId)
        .eq("status", "confirmed")
        .eq("ongoing", true),
      admin.from("case_studies").select("id").eq("company_id", companyId),
    ]);

  const caseIds = (caseRows.data ?? []).map((r) => r.id as string);
  let clientConfirmedCaseStudies = 0;
  let partnerConfirmedCaseStudies = 0;

  if (caseIds.length > 0) {
    const { data: clientConfirmed } = await admin
      .from("case_study_client_confirmation_requests")
      .select("case_study_id")
      .eq("status", "confirmed")
      .in("case_study_id", caseIds);
    const clientSet = new Set(
      (clientConfirmed ?? []).map((r) => r.case_study_id as string),
    );
    clientConfirmedCaseStudies = clientSet.size;

    const { data: partnerConfirmed } = await admin
      .from("case_study_partners")
      .select("case_study_id")
      .eq("confirmed", true)
      .in("case_study_id", caseIds);
    const partnerOnly = new Set<string>();
    for (const row of partnerConfirmed ?? []) {
      const id = row.case_study_id as string;
      if (!clientSet.has(id)) partnerOnly.add(id);
    }
    partnerConfirmedCaseStudies = partnerOnly.size;
  }

  return computeTrustScore({
    confirmedPartners:
      (partnersAsRequester.count ?? 0) + (partnersAsRecipient.count ?? 0),
    confirmedReferences: endedRefs.count ?? 0,
    ongoingReferences: ongoingRefs.count ?? 0,
    clientConfirmedCaseStudies,
    partnerConfirmedCaseStudies,
  });
}

export async function listAgentReferences(
  admin: SupabaseClient,
  companyId: string,
  opts: { status?: string; limit: number; offset: number },
): Promise<{ references: AgentReference[]; count: number }> {
  // Explicit columns — never confirm_token or invite_email
  let q = admin
    .from("service_references")
    .select(
      "id, client_name, client_company_id, service, started_year, ongoing, ended_year, status, created_at, confirmed_at, confirmation_level, disclosure",
      { count: "exact" },
    )
    .eq("provider_company_id", companyId)
    .order("created_at", { ascending: false })
    .range(opts.offset, opts.offset + opts.limit - 1);

  if (opts.status) {
    q = q.eq("status", opts.status);
  }

  const { data, count, error } = await q;
  if (error) {
    console.error("[listAgentReferences]", error.message);
    return { references: [], count: 0 };
  }

  const references: AgentReference[] = (data ?? []).map((r) => ({
    id: r.id as string,
    client_name: r.client_name as string,
    client_company_id: (r.client_company_id as string | null) ?? null,
    service: r.service as string,
    started_year: r.started_year as string,
    ongoing: Boolean(r.ongoing),
    ended_year: (r.ended_year as string | null) ?? null,
    status: r.status as AgentReference["status"],
    created_at: r.created_at as string,
    confirmed_at: (r.confirmed_at as string | null) ?? null,
    confirmation_level:
      r.confirmation_level === 1 ||
      r.confirmation_level === 2 ||
      r.confirmation_level === 3
        ? r.confirmation_level
        : null,
    disclosure:
      r.disclosure === "named" || r.disclosure === "undisclosed"
        ? r.disclosure
        : null,
  }));

  return { references, count: count ?? references.length };
}

function mapAgentCaseStudyRow(
  r: Record<string, unknown>,
  companySlug?: string,
): AgentCaseStudy {
  const slug = r.slug as string;
  return {
    id: r.id as string,
    slug,
    title: r.title as string,
    summary: r.summary as string,
    challenge: (r.challenge as string) ?? "",
    outcome: (r.outcome as string) ?? "",
    process: (r.process as string) ?? "",
    location: (r.location as string) ?? "",
    year: (r.year as string) ?? "",
    duration: (r.duration as string) ?? "",
    sector: (r.sector as string) ?? "",
    scope: (r.scope as string) ?? "",
    client_label: (r.client_label as string) ?? "",
    highlight_stat: (r.highlight_stat as string) ?? "",
    client_quote: (r.client_quote as string) ?? "",
    metrics: (r.metrics as AgentCaseStudy["metrics"]) ?? [],
    services: (r.services as string[]) ?? [],
    cover_image_url: (r.cover_image_url as string | null) ?? null,
    gallery_urls: (r.gallery_urls as string[]) ?? [],
    created_at: r.created_at as string,
    ...(companySlug
      ? { public_url: `/c/${companySlug}/case-studies/${slug}` }
      : {}),
  };
}

const CASE_STUDY_AGENT_SELECT =
  "id, slug, title, summary, challenge, outcome, process, location, year, duration, sector, scope, client_label, highlight_stat, client_quote, metrics, services, cover_image_url, gallery_urls, created_at";

export async function listAgentCaseStudies(
  admin: SupabaseClient,
  companyId: string,
): Promise<AgentCaseStudy[]> {
  const { data: company } = await admin
    .from("companies")
    .select("slug")
    .eq("id", companyId)
    .maybeSingle();

  const { data, error } = await admin
    .from("case_studies")
    .select(CASE_STUDY_AGENT_SELECT)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listAgentCaseStudies]", error.message);
    return [];
  }

  const slug = (company?.slug as string) ?? "";
  return (data ?? []).map((r) => mapAgentCaseStudyRow(r, slug));
}

export async function getAgentCaseStudy(
  admin: SupabaseClient,
  companyId: string,
  caseStudyId: string,
): Promise<AgentCaseStudy | null> {
  const { data: company } = await admin
    .from("companies")
    .select("slug")
    .eq("id", companyId)
    .maybeSingle();

  const { data, error } = await admin
    .from("case_studies")
    .select(CASE_STUDY_AGENT_SELECT)
    .eq("company_id", companyId)
    .eq("id", caseStudyId)
    .maybeSingle();

  if (error || !data) return null;
  return mapAgentCaseStudyRow(data, (company?.slug as string) ?? "");
}

export async function listAgentPartnerships(
  admin: SupabaseClient,
  companyId: string,
  status?: string,
): Promise<AgentPartnership[]> {
  let q = admin
    .from("partnerships")
    .select("id, status, requester_id, recipient_id, created_at")
    .or(`requester_id.eq.${companyId},recipient_id.eq.${companyId}`)
    .order("created_at", { ascending: false });

  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error || !data?.length) {
    if (error) console.error("[listAgentPartnerships]", error.message);
    return [];
  }

  const otherIds = [
    ...new Set(
      data.map((p) =>
        p.requester_id === companyId
          ? (p.recipient_id as string)
          : (p.requester_id as string),
      ),
    ),
  ];

  const { data: companies } = await admin
    .from("companies")
    .select("id, name, slug")
    .in("id", otherIds);

  const map = new Map(
    (companies ?? []).map((c) => [c.id as string, c] as const),
  );

  return data.map((p) => {
    const role: "requester" | "recipient" =
      p.requester_id === companyId ? "requester" : "recipient";
    const otherId =
      role === "requester"
        ? (p.recipient_id as string)
        : (p.requester_id as string);
    const other = map.get(otherId);
    return {
      id: p.id as string,
      status: p.status as string,
      role,
      other_company: {
        id: otherId,
        name: (other?.name as string) ?? "",
        slug: (other?.slug as string) ?? "",
      },
      created_at: p.created_at as string,
    };
  });
}

export async function listAgentInquiries(
  admin: SupabaseClient,
  companyId: string,
  opts: { status?: string; limit: number },
): Promise<AgentInquiry[]> {
  // Own inquiries only — never private_feedback / foreign data
  let q = admin
    .from("inquiries")
    .select(
      "id, sender_name, sender_email, sender_company, message, service_interest, status, created_at",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(opts.limit);

  if (opts.status) q = q.eq("status", opts.status);

  const { data, error } = await q;
  if (error) {
    console.error("[listAgentInquiries]", error.message);
    return [];
  }

  return (data ?? []).map((r) => {
    const email = r.sender_email as string;
    const subject = encodeURIComponent(
      `Re: ${(r.service_interest as string) || "your inquiry"}`,
    );
    return {
      id: r.id as string,
      sender_name: r.sender_name as string,
      sender_email: email,
      mailto: `mailto:${email}?subject=${subject}`,
      sender_company: (r.sender_company as string) ?? "",
      message: r.message as string,
      service_interest: (r.service_interest as string) ?? "",
      status: r.status as string,
      created_at: r.created_at as string,
    };
  });
}

export async function getAgentAnalytics(
  admin: SupabaseClient,
  companyId: string,
  days: number,
) {
  const capped = Math.min(Math.max(days, 1), 365);
  const { data, error } = await admin.rpc("get_profile_analytics", {
    p_company_id: companyId,
    p_days: capped,
  });
  if (error) {
    console.error("[getAgentAnalytics]", error.message);
    return { days: capped, profile_views: 0, one_pager_views: 0, embed_views: 0, inquiries: 0 };
  }
  return data;
}

export async function listAgentAuditLog(
  admin: SupabaseClient,
  companyId: string,
  limit: number,
): Promise<AgentAuditRow[]> {
  const { data, error } = await admin
    .from("api_audit_log")
    .select("id, method, path, action, status, summary, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listAgentAuditLog]", error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    id: Number(r.id),
    method: r.method as string,
    path: r.path as string,
    action: r.action as string,
    status: r.status as number,
    summary: (r.summary as string) ?? "",
    created_at: r.created_at as string,
  }));
}

export async function getCompanyMetaForAgent(
  admin: SupabaseClient,
  companyId: string,
) {
  const { data } = await admin
    .from("companies")
    .select("id, name, slug, verified")
    .eq("id", companyId)
    .maybeSingle();
  return data as {
    id: string;
    name: string;
    slug: string;
    verified: boolean;
  } | null;
}
