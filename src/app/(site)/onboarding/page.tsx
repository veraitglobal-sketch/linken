import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { OnboardingStage } from "@/components/onboarding/onboarding-stage";
import { readOnboardingDraft } from "@/features/company/onboarding-draft";

export const metadata: Metadata = {
  title: "Create company",
  description: "Register your company profile on Hansala.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const draft = await readOnboardingDraft();

  return (
    <section className="flex flex-1 items-center px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] lg:min-h-[min(72vh,720px)] lg:grid-cols-[0.95fr_1.05fr]">
        <OnboardingStage />
        <OnboardingForm error={error} draft={draft} />
      </div>
    </section>
  );
}
