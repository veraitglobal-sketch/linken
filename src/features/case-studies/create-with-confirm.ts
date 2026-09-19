"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCaseStudyCore,
  requestClientConfirmationCore,
  tagCaseStudyPartnerCore,
} from "@/features/case-studies/core";
import { requireOwnedActiveCompany } from "@/features/workspace/require-owned";
import { requireOperatorForCompanySlug } from "@/features/workspace/require-operator-slug";
import { setWorkspacePreference } from "@/features/workspace/set-preference";
import { safeAppBack, withBackQuery } from "@/lib/safe-back";

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

  const { logActivationEvent } = await import("@/features/activation/events");
  void logActivationEvent(company.id, "first_project_created");

  if (partnerSlug) {
    await tagCaseStudyPartnerCore(supabase, {
      companyId: company.id,
      caseStudyId: created.data.id,
      partnerCompanySlug: partnerSlug,
      role: "Partner",
    });
  }

  void logActivationEvent(company.id, "first_invitation_started");
  const confirm = await requestClientConfirmationCore(supabase, {
    companyId: company.id,
    companyName: company.name,
    companySlug: company.slug,
    caseStudySlug: created.data.slug,
    email,
  });
  if (confirm.ok) {
    void logActivationEvent(company.id, "first_invitation_sent");
  }

  revalidatePath("/dashboard/cases");
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/case-studies/${created.data.slug}`);

  redirect(
    withBackQuery(`/dashboard/cases/${created.data.slug}`, {
      created: created.data.slug,
      ...(confirm.ok
        ? { sent: "1" }
        : { error: `Case created, but email failed: ${confirm.error}` }),
    }),
  );
}
