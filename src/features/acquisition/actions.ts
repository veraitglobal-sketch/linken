"use server";

import { redirect } from "next/navigation";
import { saveOnboardingDraft } from "@/features/company/onboarding-draft";

/** Prefill onboarding from a post-confirm acquisition CTA. */
export async function seedOnboardingFromConfirm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const website = String(formData.get("website") ?? "").trim().slice(0, 200);

  await saveOnboardingDraft({
    name,
    website,
    category: "",
    city: "",
    description: "",
  });

  redirect("/onboarding");
}
