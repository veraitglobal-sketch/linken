"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCaseStudyCore,
  requestClientConfirmationCore,
  tagCaseStudyPartnerCore,
  updateCaseStudyCore,
} from "@/features/case-studies/core";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import { requireOwnedActiveCompany } from "@/features/workspace/require-owned";
import { requireOperatorForCompanySlug } from "@/features/workspace/require-operator-slug";
import { setWorkspacePreference } from "@/features/workspace/set-preference";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";
import { parseMetricsFromForm } from "@/lib/case-study-metrics";
import { createClient } from "@/lib/supabase/server";

/** One step: create case study + email client for confirmation. */
export async function createCaseStudyWithConfirm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const challenge = String(formData.get("challenge") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "").trim();
  const process = String(formData.get("process") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const servicesRaw = String(formData.get("services") ?? "").trim();
  const services = servicesRaw
    ? servicesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const partnerSlug = String(formData.get("partner_slug") ?? "")
    .trim()
    .toLowerCase();
  const companySlugField = String(formData.get("company_slug") ?? "").trim();
  const back = safeAppBack(
    String(formData.get("back") ?? "/dashboard/cases"),
    "/dashboard/cases",
  );

  if (!title || !summary) {
    redirect(withBackQuery(back, { error: "Title and summary are required." }));
  }
  if (!email.includes("@")) {
    redirect(
      withBackQuery(back, {
        error: "Client email is required so we can send the confirmation.",
      }),
    );
  }

  const { supabase, company } = companySlugField
    ? await requireOperatorForCompanySlug({
        slug: companySlugField,
        loginNext: back,
      })
    : await requireOwnedActiveCompany({ loginNext: back });

  await setWorkspacePreference("company", company.id);

  const created = await createCaseStudyCore(supabase, {
    companyId: company.id,
    title,
    summary,
    challenge,
    outcome,
    process,
    location,
    year: year || new Date().getFullYear().toString(),
    services,
  });

  if (!created.ok) {
    redirect(withBackQuery(back, { error: created.error }));
  }

  if (partnerSlug) {
    await tagCaseStudyPartnerCore(supabase, {
      companyId: company.id,
      caseStudyId: created.data.id,
      partnerCompanySlug: partnerSlug,
      role: "Partner",
    });
  }

  const confirm = await requestClientConfirmationCore(supabase, {
    companyId: company.id,
    companyName: company.name,
    companySlug: company.slug,
    caseStudySlug: created.data.slug,
    email,
  });

  revalidatePath("/dashboard/cases");
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/case-studies/${created.data.slug}`);

  redirect(
    withBackQuery(`/dashboard/cases/${created.data.slug}`, {
      created: created.data.slug,
      ...(confirm.ok ? { sent: "1" } : { error: `Case created, but email failed: ${confirm.error}` }),
    }),
  );
}

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

  revalidatePath(back.split("?")[0]?.split("#")[0] || back);
  revalidatePath(`/c/${company.slug}`);
  redirect(withBackQuery(back, { requested: "1" }));
}

export async function confirmClientRequest(formData: FormData) {
  await respondClientRequest(formData, "confirmed");
}

export async function declineClientRequest(formData: FormData) {
  await respondClientRequest(formData, "declined");
}

async function respondClientRequest(
  formData: FormData,
  response: "confirmed" | "declined",
) {
  const token = String(formData.get("token") ?? "").trim();
  const path = `/confirm/${token}`;

  const { supabase, company } = await requireOwnedActiveCompany({
    loginNext: path,
  });

  const { error } = await supabase.rpc("respond_client_confirmation", {
    p_token: token,
    p_response: response,
    p_company_id: company.id,
  });

  if (error) {
    redirect(withBackQuery(path, { error: error.message }));
  }

  revalidatePath(path);
  revalidatePath(`/c/${company.slug}`);
  revalidatePath("/welcome");
  redirect(withBackQuery(path, { done: response }));
}

/** Partner confirms their tagged role on someone else's case study — RLS
 * only allows this from the tagged partner's own owner, never the case
 * study's own operator (sacred rule: never self-confirm). */
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

  revalidatePath(back);
  revalidatePath("/dashboard/inbox");
  redirect(withBackQuery(back, { caseStudyConfirmed: "1" }));
}
