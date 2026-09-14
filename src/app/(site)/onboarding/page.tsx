import type { Metadata } from "next";
import { OnboardingWorkspace } from "@/components/onboarding/onboarding-workspace";
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
      <OnboardingWorkspace
        error={error}
        draft={mergedDraft}
        partnerMode={kindHint === "developer_partner"}
      />
    </section>
  );
}
