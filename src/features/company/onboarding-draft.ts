import { cookies } from "next/headers";

export const ONBOARDING_DRAFT_COOKIE = "hansala_onboarding_draft";

export type OnboardingDraft = {
  name: string;
  organizationKind: string;
  category: string;
  city: string;
  website: string;
  description: string;
};

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
    };
  } catch {
    return null;
  }
}

export async function clearOnboardingDraft() {
  const jar = await cookies();
  jar.delete(ONBOARDING_DRAFT_COOKIE);
}
