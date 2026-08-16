import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { OnboardingStage } from "@/components/onboarding/onboarding-stage";
import { readOnboardingDraft } from "@/features/company/onboarding-draft";
import { captureReferralFromRefParam } from "@/features/growth/capture-referral";

export const metadata: Metadata = {
  title: "Create company",
  description: "Register your company profile on Hansala.",
};

type Props = {
  searchParams: Promise<{ error?: string; ref?: string; kind?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const { error, ref, kind } = await searchParams;
  await captureReferralFromRefParam(ref);
  const draft = await readOnboardingDraft();
  const kindHint =
    kind === "developer_partner" ? "developer_partner" : undefined;
  const mergedDraft = kindHint
    ? {
        name: draft?.name ?? "",
        organizationKind: kindHint,
        category: draft?.category ?? "",
        city: draft?.city ?? "",
        website: draft?.website ?? "",
        description: draft?.description ?? "",
      }
    : draft;

  return (
    <section className="flex flex-1 items-center px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] lg:min-h-[min(72vh,720px)] lg:grid-cols-[0.95fr_1.05fr]">
        <OnboardingStage partnerMode={kindHint === "developer_partner"} />
        <OnboardingForm
          error={error}
          draft={mergedDraft}
          partnerMode={kindHint === "developer_partner"}
        />
      </div>
    </section>
  );
}
