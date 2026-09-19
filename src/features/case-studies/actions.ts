"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  requestClientConfirmationCore,
  updateCaseStudyCore,
} from "@/features/case-studies/core";
import { requireOwnedActiveCompany } from "@/features/workspace/require-owned";
import { requireOperatorForCompanySlug } from "@/features/workspace/require-operator-slug";
import { setWorkspacePreference } from "@/features/workspace/set-preference";
import { parseMetricsFromForm } from "@/lib/case-study-metrics";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";

function parseServices(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function updateCaseStudyContent(formData: FormData) {
  const caseSlug = String(formData.get("case_slug") ?? "").trim();
  const back = safeAppBack(
    String(formData.get("back") ?? `/dashboard/cases/${caseSlug}`),
    `/dashboard/cases/${caseSlug}`,
  );
  const companySlugField = String(formData.get("company_slug") ?? "").trim();

  const { supabase, company } = companySlugField
    ? await requireOperatorForCompanySlug({
        slug: companySlugField,
        loginNext: back,
      })
    : await requireOwnedActiveCompany({ loginNext: back });

  const { data: existing } = await supabase
    .from("case_studies")
    .select("id")
    .eq("company_id", company.id)
    .eq("slug", caseSlug)
    .maybeSingle();

  if (!existing) {
    redirect(withBackQuery(back, { error: "Case study not found." }));
  }

  const result = await updateCaseStudyCore(supabase, {
    companyId: company.id,
    caseStudyId: existing.id as string,
    title: String(formData.get("title") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    challenge: String(formData.get("challenge") ?? "").trim(),
    outcome: String(formData.get("outcome") ?? "").trim(),
    process: String(formData.get("process") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    year: String(formData.get("year") ?? "").trim(),
    duration: String(formData.get("duration") ?? "").trim(),
    sector: String(formData.get("sector") ?? "").trim(),
    scope: String(formData.get("scope") ?? "").trim(),
    clientLabel: String(formData.get("client_label") ?? "").trim(),
    highlightStat: String(formData.get("highlight_stat") ?? "").trim(),
    clientQuote: String(formData.get("client_quote") ?? "").trim(),
    metrics: parseMetricsFromForm(formData),
    services: parseServices(String(formData.get("services") ?? "")),
  });

  if (!result.ok) {
    redirect(withBackQuery(back, { error: result.error }));
  }

  revalidatePath(back);
  revalidatePath("/dashboard/cases");
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/case-studies/${caseSlug}`);
  redirect(withBackQuery(back, { saved: "1" }));
}

export async function requestClientConfirmation(formData: FormData) {
  const companySlug = String(formData.get("companySlug") ?? "").trim();
  const caseSlug = String(formData.get("caseSlug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const back = safeAppBack(
    String(formData.get("back") ?? "").trim() ||
      `/c/${companySlug}/case-studies/${caseSlug}`,
    `/c/${companySlug}/case-studies/${caseSlug}`,
  );

  if (!companySlug || !caseSlug || !email || !email.includes("@")) {
    redirect(withBackQuery(back, { error: "Enter a valid client email." }));
  }

  const { supabase, company } = await requireOperatorForCompanySlug({
    slug: companySlug,
    loginNext: back,
  });
  await setWorkspacePreference("company", company.id);

  const { logActivationEvent } = await import("@/features/activation/events");
  void logActivationEvent(company.id, "first_invitation_started");
  const result = await requestClientConfirmationCore(supabase, {
    companyId: company.id,
    companyName: company.name,
    companySlug: company.slug,
    caseStudySlug: caseSlug,
    email,
  });

  if (!result.ok) {
    redirect(withBackQuery(back, { error: result.error }));
  }
  void logActivationEvent(company.id, "first_invitation_sent");

  revalidatePath(back.split("?")[0]?.split("#")[0] || back);
  revalidatePath(`/c/${company.slug}`);
  redirect(withBackQuery(back, { requested: "1" }));
}
