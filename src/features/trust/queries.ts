import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  computeTrustScore,
  getTrustNextStep,
  type TrustScoreResult,
  type TrustNextStep,
} from "@/features/trust/score";

export type TrustProfile = TrustScoreResult & {
  nextStep: TrustNextStep;
};

function emptyTrust(companySlug: string): TrustProfile {
  const result = computeTrustScore({
    confirmedPartners: 0,
    confirmedReferences: 0,
    ongoingReferences: 0,
    clientConfirmedCaseStudies: 0,
    partnerConfirmedCaseStudies: 0,
  });
  return { ...result, nextStep: getTrustNextStep(result, companySlug) };
}

/** Confirmed-evidence counts only — never select token/email columns. */
async function getTrustProfileUncached(
  companyId: string,
  companySlug: string,
): Promise<TrustProfile> {
  if (!companyId || companyId.length < 20) {
    // Mock ids like "c1" — no DB evidence
    return emptyTrust(companySlug);
  }

  try {
    const supabase = await createClient();

    const [partnersAsRequester, partnersAsRecipient, endedRefs, ongoingRefs, caseRows] =
      await Promise.all([
        supabase
          .from("partnerships")
          .select("id", { count: "exact", head: true })
          .eq("status", "accepted")
          .eq("requester_id", companyId),
        supabase
          .from("partnerships")
          .select("id", { count: "exact", head: true })
          .eq("status", "accepted")
          .eq("recipient_id", companyId),
        supabase
          .from("service_references")
          .select("id", { count: "exact", head: true })
          .eq("provider_company_id", companyId)
          .eq("status", "confirmed")
          .eq("ongoing", false),
        supabase
          .from("service_references")
          .select("id", { count: "exact", head: true })
          .eq("provider_company_id", companyId)
          .eq("status", "confirmed")
          .eq("ongoing", true),
        supabase
          .from("case_studies")
          .select("id")
          .eq("company_id", companyId),
      ]);

    const confirmedPartners =
      (partnersAsRequester.count ?? 0) + (partnersAsRecipient.count ?? 0);
    const confirmedReferences = endedRefs.count ?? 0;
    const ongoingReferences = ongoingRefs.count ?? 0;

    const caseIds = (caseRows.data ?? []).map((row) => row.id as string);
    let clientConfirmedCaseStudies = 0;
    let partnerConfirmedCaseStudies = 0;

    if (caseIds.length > 0) {
      const [{ data: clientConfirmed }, { data: partnerConfirmed }] =
        await Promise.all([
          supabase
            .from("case_study_client_confirmation_requests")
            .select("case_study_id")
            .eq("status", "confirmed")
            .in("case_study_id", caseIds),
          supabase
            .from("case_study_partners")
            .select("case_study_id")
            .eq("confirmed", true)
            .in("case_study_id", caseIds),
        ]);

      const clientSet = new Set(
        (clientConfirmed ?? []).map((row) => row.case_study_id as string),
      );
      clientConfirmedCaseStudies = clientSet.size;

      const partnerOnly = new Set<string>();
      for (const row of partnerConfirmed ?? []) {
        const id = row.case_study_id as string;
        if (!clientSet.has(id)) partnerOnly.add(id);
      }
      partnerConfirmedCaseStudies = partnerOnly.size;
    }

    const result = computeTrustScore({
      confirmedPartners,
      confirmedReferences,
      ongoingReferences,
      clientConfirmedCaseStudies,
      partnerConfirmedCaseStudies,
    });

    return {
      ...result,
      nextStep: getTrustNextStep(result, companySlug),
    };
  } catch {
    return emptyTrust(companySlug);
  }
}

/**
 * Same company's trust profile is often requested more than once while
 * rendering a single page (hero band, sidebar, network node, JSON-LD...).
 * React's cache() deduplicates identical calls within one request — no
 * staleness risk, it never persists across requests.
 */
export const getTrustProfile = cache(getTrustProfileUncached);
