import {
  deriveActivationSteps,
  signalsFromRows,
  type ActivationStep,
  type ActivationStepId,
} from "@/features/activation/derive";
import { createClient } from "@/lib/supabase/server";

export type { ActivationStep, ActivationStepId };

export type ActivationChecklist = {
  companyId: string;
  companySlug: string;
  steps: ActivationStep[];
  doneCount: number;
  total: number;
  complete: boolean;
  /** First incomplete step — for “Next step” strips. */
  next: ActivationStep | null;
  /** True once the first mutual confirmation exists. */
  activated: boolean;
};

/**
 * Derive activation progress from live data — never stored separately.
 * Win condition: first confirmed reference / partnership / case.
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

    const cases = casesRes.data ?? [];
    const hasConfirmedCasePartner = await hasConfirmedCaseStudyPartner(
      supabase,
      cases.map((c) => c.id as string),
    );

    const signals = signalsFromRows({
      companySlug: company.slug as string,
      verified: Boolean(company.verified),
      refs: (refsRes.data ?? []).map((r) => ({
        status: r.status as string,
        invite_email: (r.invite_email as string | null) ?? null,
      })),
      caseCount: cases.length,
      confReqs: (confReqsRes.data ?? []).map((r) => ({
        status: r.status as string,
        email: (r.email as string | null) ?? null,
      })),
      partnerships: (partnershipsRes.data ?? []).map((r) => ({
        status: r.status as string,
      })),
      hasConfirmedCasePartner,
      websiteLinked: Boolean(verRes.data?.website_linked),
      hasEmbedView: (embedRes.data ?? []).length > 0,
    });

    const steps = deriveActivationSteps(signals);
    const doneCount = steps.filter((s) => s.done).length;
    const next = steps.find((s) => !s.done) ?? null;

    return {
      companyId,
      companySlug: company.slug as string,
      steps,
      doneCount,
      total: steps.length,
      complete: doneCount === steps.length,
      next,
      activated: signals.hasConfirmation,
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
