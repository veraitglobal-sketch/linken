"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveCategoryWrite, resolveCountryWrite } from "@/features/categories/apply";
import { recordCategoryUnmatched } from "@/features/categories/unmatched";
import {
  clearOnboardingDraft,
  draftFromFormData,
  saveOnboardingDraft,
} from "@/features/company/onboarding-draft";
import { parseOrganizationKind } from "@/features/company/organization-kind";
import { applyReferralAttribution } from "@/features/growth/apply-referral";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { uniqueCompanySlug } from "@/features/partners/unique-slug";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import { tryEmailDomainVerificationAfterOnboarding } from "@/features/verification/actions";
import { setWorkspacePreference } from "@/features/workspace/set-preference";
import { toSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

export async function createCompany(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const cat = resolveCategoryWrite(String(formData.get("category") ?? ""));
  const geo = resolveCountryWrite(
    String(formData.get("country_code") ?? ""),
    String(formData.get("country") ?? ""),
  );
  const category = cat.category;
  const city = String(formData.get("city") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const organizationKind =
    parseOrganizationKind(String(formData.get("organization_kind") ?? "")) ??
    "company";
  const displayName = String(formData.get("display_name") ?? "").trim();
  const displayTitle = String(formData.get("display_title") ?? "").trim();
  const baseSlug = toSlug(name);

  if (!name || !baseSlug) {
    redirect("/onboarding?error=Organization%20name%20is%20required");
  }
  if (!website) {
    redirect("/onboarding?error=Website%20is%20required");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await saveOnboardingDraft(draftFromFormData(formData));
    const next =
      organizationKind === "developer_partner"
        ? "/onboarding?kind=developer_partner"
        : "/onboarding";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

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
        organization_kind: organizationKind,
        category,
        category_slug: cat.category_slug,
        city,
        country: geo.country || "Germany",
        country_code: geo.country_code,
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

  if (cat.unmatched) void recordCategoryUnmatched(category);
  await clearOnboardingDraft();

  if (displayName || displayTitle) {
    await supabase
      .from("company_members")
      .update({
        ...(displayName ? { display_name: displayName } : {}),
        ...(displayTitle ? { display_title: displayTitle } : {}),
      })
      .eq("company_id", created.id)
      .eq("user_id", user.id);
  }

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

  if (website) scheduleCompanyLogoFetch(created.id);
  void matchCompanyToSearches(created.id, "new_company");
  if (autoVerified) void matchCompanyToSearches(created.id, "became_verified");

  await setWorkspacePreference("company", created.id);
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/c/${created.slug}`);
  revalidatePath("/dashboard");

  const { logActivationEvent } = await import("@/features/activation/events");
  void logActivationEvent(created.id, "company_created");
  void logActivationEvent(
    created.id,
    autoVerified ? "domain_verified" : "domain_verification_started",
  );
  await applyReferralAttribution(created.id);
  void import("@/features/ranking/refresh").then(({ refreshRank }) =>
    refreshRank(created.id),
  );

  if (!autoVerified) redirect("/onboarding/verify");
  if (organizationKind === "developer_partner") redirect("/dashboard");
  redirect("/welcome?from=onboarding");
}
