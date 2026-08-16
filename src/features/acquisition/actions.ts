"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { saveOnboardingDraft } from "@/features/company/onboarding-draft";
import {
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE,
  sanitizeReferralSlug,
} from "@/features/growth/referral";

/** Prefill onboarding from a post-confirm CTA — optional, never auto-publishes. */
export async function seedOnboardingFromConfirm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const website = String(formData.get("website") ?? "").trim().slice(0, 200);
  const referrer = sanitizeReferralSlug(
    String(formData.get("referrer_slug") ?? ""),
  );

  await saveOnboardingDraft({
    name,
    organizationKind: "company",
    website,
    category: "",
    city: "",
    description: "",
  });

  if (referrer) {
    const jar = await cookies();
    jar.set(REFERRAL_COOKIE, referrer, {
      path: "/",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  redirect("/onboarding");
}
