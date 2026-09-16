import { cookies } from "next/headers";

export const ONBOARDING_DRAFT_COOKIE = "hansala_onboarding_draft";

export type OnboardingDraft = {
  name: string;
  organizationKind: string;
  category: string;
  city: string;
  website: string;
  description: string;
  displayName?: string;
  displayTitle?: string;
  countryCode?: string;
  email?: string;
};

export function draftFromFormData(formData: FormData): OnboardingDraft {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  return {
    name: get("name"),
    organizationKind: get("organization_kind"),
    category: get("category"),
    city: get("city"),
    website: get("website"),
    description: get("description"),
    displayName: get("display_name"),
    displayTitle: get("display_title"),
    countryCode: get("country_code"),
    email: get("email"),
  };
}

export async function saveOnboardingDraft(draft: OnboardingDraft) {
  const jar = await cookies();
  jar.set(ONBOARDING_DRAFT_COOKIE, JSON.stringify(draft), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });
}

export async function readOnboardingDraft(): Promise<OnboardingDraft | null> {
  const jar = await cookies();
  const raw = jar.get(ONBOARDING_DRAFT_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (!parsed || typeof parsed.name !== "string") return null;
    return {
      name: parsed.name ?? "",
      organizationKind: parsed.organizationKind ?? "company",
      category: parsed.category ?? "",
      city: parsed.city ?? "",
      website: parsed.website ?? "",
      description: parsed.description ?? "",
      displayName: parsed.displayName ?? "",
      displayTitle: parsed.displayTitle ?? "",
      countryCode: parsed.countryCode ?? "",
      email: parsed.email ?? "",
    };
  } catch {
    return null;
  }
}

export async function clearOnboardingDraft() {
  const jar = await cookies();
  jar.delete(ONBOARDING_DRAFT_COOKIE);
}
