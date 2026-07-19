"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isAssessmentStrength,
  type AssessmentSourceType,
} from "@/features/assessments/catalog";
import { createClient } from "@/lib/supabase/server";

function parseSourceType(raw: string): AssessmentSourceType | null {
  if (raw === "reference" || raw === "confirmation") return raw;
  return null;
}

export async function submitClientAssessment(formData: FormData) {
  const sourceType = parseSourceType(String(formData.get("source_type") ?? ""));
  const sourceId = String(formData.get("source_id") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "/").trim() || "/";
  const providerSlug = String(formData.get("provider_slug") ?? "").trim();
  const wouldRaw = String(formData.get("would_work_again") ?? "").trim();
  const privateFeedback = String(formData.get("private_feedback") ?? "").trim();
  const strengths = formData
    .getAll("strengths")
    .map((v) => String(v))
    .filter(isAssessmentStrength);

  if (!sourceType || !sourceId) {
    redirect(`${returnTo}?error=${encodeURIComponent("Invalid assessment.")}`);
  }

  const wouldWorkAgain =
    wouldRaw === "yes" ? true : wouldRaw === "no" ? false : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  const { error } = await supabase.rpc("submit_client_assessment", {
    p_source_type: sourceType,
    p_source_id: sourceId,
    p_strengths: strengths,
    p_would_work_again: wouldWorkAgain,
    p_private_feedback: privateFeedback,
  });

  if (error) {
    redirect(
      `${returnTo}?error=${encodeURIComponent(error.message ?? "Could not save.")}`,
    );
  }

  revalidatePath(returnTo);
  revalidatePath("/dashboard");
  if (providerSlug) revalidatePath(`/c/${providerSlug}`);
  redirect(`${returnTo}?assessed=1`);
}
