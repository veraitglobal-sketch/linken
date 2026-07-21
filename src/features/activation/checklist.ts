import { createClient } from "@/lib/supabase/server";

export type ActivationStepId =
  | "verify_domain"
  | "invite_partner"
  | "add_evidence"
  | "send_confirmation"
  | "get_confirmation"
  | "embed_badge";

export type ActivationStep = {
  id: ActivationStepId;
  label: string;
  href: string;
  done: boolean;
};

export type ActivationChecklist = {
  companyId: string;
  companySlug: string;
  steps: ActivationStep[];
  doneCount: number;
  total: number;
  complete: boolean;
  /** First incomplete step — for “Next step” strips. */
  next: ActivationStep | null;
};

/**
 * Derive activation progress from live data — never stored separately.
 * Order: verify → partner (network) → evidence → confirmations → badge.
 */
export async function getActivationChecklist(
  companyId: string,
): Promise<ActivationChecklist | null> {
  if (!companyId) return null;

  try {
    const supabase = await createClient();

    const [
      companyRes,
      verRes,
      refsRes,
      casesRes,
      confReqsRes,
      partnershipsRes,
      embedRes,
    ] = await Promise.all([
      supabase
        .from("companies")
        .select("id, slug, verified")
        .eq("id", companyId)
        .maybeSingle(),
      supabase
        .from("company_verifications")
        .select("website_linked")
        .eq("company_id", companyId)
        .maybeSingle(),
      supabase
        .from("service_references")
        .select("id, status, invite_email")
        .eq("provider_company_id", companyId),
      supabase
        .from("case_studies")
        .select("id")
        .eq("company_id", companyId),
      supabase
        .from("case_study_client_confirmation_requests")
        .select("id, status, email, case_study_id")
        .eq("requested_by_company_id", companyId),
      supabase
        .from("partnerships")
        .select("id, status")
        .or(`requester_id.eq.${companyId},recipient_id.eq.${companyId}`),
      supabase
        .from("profile_events")
        .select("id")
        .eq("company_id", companyId)
        .eq("event_type", "embed_view")
        .limit(1),
    ]);

    const company = companyRes.data;
    if (!company) return null;

    const slug = company.slug as string;
    const profileHref = `/c/${slug}`;
    const refs = refsRes.data ?? [];
    const cases = casesRes.data ?? [];
    const confReqs = confReqsRes.data ?? [];
    const partnerships = partnershipsRes.data ?? [];

    const hasEvidence = refs.length > 0 || cases.length > 0;

    const hasSentConfirmation =
      refs.some((r) => Boolean((r.invite_email as string | null)?.trim())) ||
      confReqs.some((r) => Boolean((r.email as string | null)?.trim()));

    const hasConfirmedRef = refs.some((r) => r.status === "confirmed");
    const hasAcceptedPartner = partnerships.some(
      (r) => r.status === "accepted",
    );
    const hasConfirmedCase =
      confReqs.some((r) => r.status === "confirmed") ||
      (await hasConfirmedCaseStudyPartner(
        supabase,
        cases.map((c) => c.id as string),
      ));

    const hasAnyConfirmation =
      hasConfirmedRef || hasAcceptedPartner || hasConfirmedCase;

    const hasPartnership = partnerships.length > 0;
    const websiteLinked = Boolean(verRes.data?.website_linked);
    const hasEmbedView = (embedRes.data ?? []).length > 0;

    const steps: ActivationStep[] = [
      {
        id: "verify_domain",
        label: "Verify your domain",
        href: "/dashboard/verification",
        done: Boolean(company.verified),
      },
      {
        id: "invite_partner",
        label: "Invite your first partner",
        href: "/dashboard/partners",
        done: hasPartnership,
      },
      {
        id: "add_evidence",
        label: "Add a reference or case study",
        href: `${profileHref}#references`,
        done: hasEvidence,
      },
      {
        id: "send_confirmation",
        label: "Send it for confirmation",
        href: `${profileHref}#references`,
        done: hasSentConfirmation,
      },
      {
        id: "get_confirmation",
        label: "Get your first confirmation",
        href: profileHref,
        done: hasAnyConfirmation,
      },
      {
        id: "embed_badge",
        label: "Put your badge on your website",
        href: "/dashboard/widgets",
        done: websiteLinked || hasEmbedView,
      },
    ];

    const doneCount = steps.filter((s) => s.done).length;
    const next = steps.find((s) => !s.done) ?? null;

    return {
      companyId,
      companySlug: slug,
      steps,
      doneCount,
      total: steps.length,
      complete: doneCount === steps.length,
      next,
    };
  } catch (err) {
    console.error("[getActivationChecklist]", err);
    return null;
  }
}

async function hasConfirmedCaseStudyPartner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  caseIds: string[],
): Promise<boolean> {
  if (caseIds.length === 0) return false;
  const { data } = await supabase
    .from("case_study_partners")
    .select("case_study_id")
    .eq("confirmed", true)
    .in("case_study_id", caseIds)
    .limit(1);
  return (data ?? []).length > 0;
}
