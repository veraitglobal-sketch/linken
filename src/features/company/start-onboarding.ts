"use server";

import { redirect } from "next/navigation";
import { registerAndSendConfirm } from "@/features/auth/send-signup-confirm";
import {
  draftFromFormData,
  saveOnboardingDraft,
} from "@/features/company/onboarding-draft";
import { parseOrganizationKind } from "@/features/company/organization-kind";
import { isExistingAccountError } from "@/features/company/signup-error";

/**
 * Unsigned onboarding: save the company as a draft, create the account, then
 * wait for the confirmation email. The profile is created after they click.
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

  const { isPlatformAdminEmail } = await import("@/features/admin/config");
  if (isPlatformAdminEmail(email)) {
    fail("This email is reserved for platform access. Use a company email.");
  }

  const registered = await registerAndSendConfirm({
    email,
    password,
    next,
  });
  if (!registered.ok) {
    if ("existing" in registered && registered.existing) {
      redirect(
        `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent("That email already has an account. Sign in to finish.")}`,
      );
    }
    const message = "error" in registered ? registered.error : "Could not create the account. Try again.";
    console.error("[onboarding] signup", message);
    if (isExistingAccountError(message)) {
      redirect(
        `/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent("That email already has an account. Sign in to finish.")}`,
      );
    }
    fail(message);
  }

  const { logActivationEvent } = await import("@/features/activation/events");
  void logActivationEvent(null, "signup_completed");
  redirect(`/onboarding/check-email?email=${encodeURIComponent(email)}`);
}
