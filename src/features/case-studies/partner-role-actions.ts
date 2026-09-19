"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { createClient } from "@/lib/supabase/server";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";

/** Partner confirms a tagged role — never the case study's own operator. */
export async function confirmCaseStudyPartnerRole(formData: FormData) {
  const caseStudyId = String(formData.get("case_study_id") ?? "").trim();
  const back = safeAppBack(String(formData.get("back") ?? ""), "/dashboard/inbox");

  const { user, company } = await getOperatorActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (!company) {
    redirect(withBackQuery(back, { error: "Switch to a company workspace first." }));
  }
  if (!caseStudyId) {
    redirect(withBackQuery(back, { error: "Missing case study." }));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("case_study_partners")
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq("case_study_id", caseStudyId)
    .eq("partner_company_id", company.id);

  if (error) {
    redirect(withBackQuery(back, { error: error.message }));
  }

  const { data: owner } = await supabase
    .from("case_studies")
    .select("company_id")
    .eq("id", caseStudyId)
    .maybeSingle();
  const { refreshRank } = await import("@/features/ranking/refresh");
  await refreshRank(
    (owner?.company_id as string | undefined) ?? null,
    company.id,
  );

  revalidatePath(back);
  revalidatePath("/dashboard/inbox");
  redirect(withBackQuery(back, { caseStudyConfirmed: "1" }));
}
