"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import {
  clearOnboardingDraft,
  saveOnboardingDraft,
} from "@/features/company/onboarding-draft";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import { tryEmailDomainVerificationAfterOnboarding } from "@/features/verification/actions";
import { requireOperatorActiveCompany } from "@/features/workspace/require-operator";
import { setWorkspacePreference } from "@/features/workspace/set-preference";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { createClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";

export async function setAcceptingClients(formData: FormData) {
  const accepting = String(formData.get("accepting_clients") ?? "") === "true";

  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: "/dashboard",
  });

  const { error } = await supabase
    .from("companies")
    .update({ accepting_clients: accepting })
    .eq("id", company.id);

  if (error) {
    redirect(
      `/dashboard?error=${encodeURIComponent(error.message ?? "Update failed")}`,
    );
  }

  if (accepting) {
    void matchCompanyToSearches(company.id, "accepting_clients");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/c/${company.slug}`);
  revalidatePath(`/c/${company.slug}/one-pager`);
  redirect("/dashboard");
}

/** Opt-out of appearing as a logo (vs name text) in partners' Logo wall embeds. */
export async function setAllowLogoInPartnerWidgets(formData: FormData) {
  const allow =
    String(formData.get("allow_logo_in_partner_widgets") ?? "") === "true";
  const back = String(formData.get("back") ?? "/dashboard/widgets").trim();
  const safeBack = back.startsWith("/dashboard") ? back : "/dashboard/widgets";

  const { supabase, company } = await requireOperatorActiveCompany({
    loginNext: safeBack,
  });

  const { error } = await supabase
    .from("companies")
    .update({ allow_logo_in_partner_widgets: allow })
    .eq("id", company.id);

  if (error) {
    redirect(
      `${safeBack}?error=${encodeURIComponent(error.message ?? "Update failed")}`,
    );
  }

  revalidatePath(safeBack);
  revalidatePath(`/c/${company.slug}`);
  redirect(`${safeBack}?logoOpt=${allow ? "on" : "off"}`);
}

export async function createCompany(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const baseSlug = toSlug(name);

  if (!name || !baseSlug) {
    redirect("/onboarding?error=Company%20name%20is%20required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await saveOnboardingDraft({ name, category, city, website, description });
    redirect(`/login?next=${encodeURIComponent("/onboarding")}`);
  }

  // If the handle is taken, bump the slug only (name stays as typed).
  let slug = await uniqueCompanySlug(supabase, name);
  let created: { id: string; slug: string } | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await supabase
      .from("companies")
      .insert({
        owner_id: user.id,
        claimed: true,
        claim_token: null,
        name,
        slug,
        category,
        city,
        website,
        description,
        tagline: description.slice(0, 120),
      })
      .select("id, slug")
      .single();

    if (!error && data) {
      created = data;
      break;
    }

    lastError = error?.message ?? "Could not create company.";
    if (!/companies_slug_key|duplicate key/i.test(lastError)) break;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  if (!created) {
    redirect(
      `/onboarding?error=${encodeURIComponent(lastError ?? "Could not create company.")}`,
    );
  }

  await clearOnboardingDraft();

  // Automatic email-domain verification when website matches work email
  let autoVerified = false;
  if (website && user.email) {
    const result = await tryEmailDomainVerificationAfterOnboarding({
      companyId: created.id,
      website,
      ownerEmail: user.email,
      slug: created.slug,
    });
    autoVerified = result.ok;
  }

  if (website) {
    scheduleCompanyLogoFetch(created.id);
  }

  void matchCompanyToSearches(created.id, "new_company");
  if (autoVerified) {
    void matchCompanyToSearches(created.id, "became_verified");
  }

  await setWorkspacePreference("company", created.id);
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/c/${created.slug}`);
  revalidatePath("/dashboard");

  const { logActivationEvent } = await import("@/features/activation/events");
  void logActivationEvent(created.id, "company_created");
  if (autoVerified) {
    void logActivationEvent(created.id, "domain_verified");
  } else {
    void logActivationEvent(created.id, "domain_verification_started");
  }

  // Mid-step when auto-verify did not pass — non-blocking “Do it later”
  if (!autoVerified) {
    redirect("/onboarding/verify");
  }

  redirect("/welcome?from=onboarding");
}
