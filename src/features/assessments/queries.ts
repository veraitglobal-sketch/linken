import {
  STRENGTH_LABELS,
  type AssessmentStrength,
  type AssessmentSourceType,
  isAssessmentStrength,
} from "@/features/assessments/catalog";
import { createClient } from "@/lib/supabase/server";

export type StrengthTally = {
  key: AssessmentStrength;
  label: string;
  count: number;
};

export type ClientAssessmentSummary = {
  assessmentCount: number;
  wouldWorkAgainYes: number;
  wouldWorkAgainTotal: number;
  topStrengths: StrengthTally[];
};

export type PrivateFeedbackItem = {
  feedback: string;
  /** Month granularity only — an exact date would identify the assessor. */
  feedbackMonth: string;
};

export async function hasAssessmentForSource(
  sourceType: AssessmentSourceType,
  sourceId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const column =
      sourceType === "reference" ? "reference_id" : "confirmation_request_id";
    const { data } = await supabase
      .from("client_assessments")
      .select("id")
      .eq(column, sourceId)
      .maybeSingle();
    return Boolean(data?.id);
  } catch {
    return false;
  }
}

export async function getClientAssessmentSummary(
  providerCompanyId: string,
): Promise<ClientAssessmentSummary> {
  const empty: ClientAssessmentSummary = {
    assessmentCount: 0,
    wouldWorkAgainYes: 0,
    wouldWorkAgainTotal: 0,
    topStrengths: [],
  };
  if (!providerCompanyId) return empty;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("client_assessments")
      .select("strengths, would_work_again")
      .eq("provider_company_id", providerCompanyId);

    if (error || !data) return empty;

    const counts = new Map<AssessmentStrength, number>();
    let wouldWorkAgainYes = 0;
    let wouldWorkAgainTotal = 0;

    for (const row of data) {
      if (row.would_work_again === true) {
        wouldWorkAgainYes += 1;
        wouldWorkAgainTotal += 1;
      } else if (row.would_work_again === false) {
        wouldWorkAgainTotal += 1;
      }
      for (const raw of row.strengths ?? []) {
        if (!isAssessmentStrength(raw)) continue;
        counts.set(raw, (counts.get(raw) ?? 0) + 1);
      }
    }

    const topStrengths = [...counts.entries()]
      .map(([key, count]) => ({
        key,
        label: STRENGTH_LABELS[key],
        count,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 5);

    return {
      assessmentCount: data.length,
      wouldWorkAgainYes,
      wouldWorkAgainTotal,
      topStrengths,
    };
  } catch {
    return empty;
  }
}

export async function getPrivateFeedbackForOwner(
  companyId: string,
): Promise<PrivateFeedbackItem[]> {
  if (!companyId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_private_feedback", {
      p_company_id: companyId,
    });
    if (error || !data) return [];
    return data.map(
      (row: { private_feedback: string; feedback_month: string }) => ({
        feedback: row.private_feedback,
        feedbackMonth: row.feedback_month,
      }),
    );
  } catch {
    return [];
  }
}
