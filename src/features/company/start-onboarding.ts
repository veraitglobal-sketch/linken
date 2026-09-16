"use server";

import { redirect } from "next/navigation";
import { createCompany } from "@/features/company/create-company";
import {
  draftFromFormData,
  saveOnboardingDraft,
} from "@/features/company/onboarding-draft";
import { parseOrganizationKind } from "@/features/company/organization-kind";
import { isExistingAccountError } from "@/features/company/signup-error";
import { getAuthSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/**
 * Unsigned onboarding: save the company as a draft, create the account, then
 * either finish now (session already present) or wait for the email link.
 */
export async function startOnboarding(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const email = get("email");
  const password = String(formData.get("password") ?? "");
  const displayName = get("display_name");
  const organizationKind =
    parseOrganizationKind(get("organization_kind")) ?? "company";
  const next =
    organizationKind === "developer_partner"
      ? "/onboarding?kind=developer_partner"
      : "/onboarding";
  const fail = (message: string): never => {
    const sep = next.includes("?") ? "&" : "?";
    redirect(`${next}${sep}error=${encodeURIComponent(message)}`);
  };

  await saveOnboardingDraft(draftFromFormData(formData));

  if (!displayName) fail("Your name is required");
  if (!email || password.length < 6) {
    fail("Enter your work email and a password of at least 6 characters");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAuthSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    if (isExistingAccountError(error.message)) {
      redirect(
        `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent("That email already has an account. Sign in to finish.")}`,
      );
    }
    fail(error.message);
  }

  const { logActivationEvent } = await import("@/features/activation/events");
  void logActivationEvent(null, "signup_completed");

  if (data.session) {
    await createCompany(formData);
  }
  redirect(`/onboarding/check-email?email=${encodeURIComponent(email)}`);
}
