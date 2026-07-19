import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { OnboardingStage } from "@/components/onboarding/onboarding-stage";

export const metadata: Metadata = {
  title: "Create company",
  description: "Register your company profile on Linken.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <section className="flex flex-1 items-center px-4 py-4">
      <div className="mx-auto grid w-full max-w-6xl gap-3 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <OnboardingStage />
        <OnboardingForm error={error} />
      </div>
    </section>
  );
}
