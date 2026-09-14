"use client";

import { useState } from "react";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { OnboardingStage } from "@/components/onboarding/onboarding-stage";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";

export type OnboardingPreviewValues = {
  name: string;
  website: string;
  category: string;
  city: string;
};

type Props = {
  error?: string;
  draft?: OnboardingDraft | null;
  partnerMode?: boolean;
};

export function OnboardingWorkspace({ error, draft = null, partnerMode = false }: Props) {
  const [values, setValues] = useState<OnboardingPreviewValues>({
    name: draft?.name ?? "",
    website: draft?.website ?? "",
    category: draft?.category ?? "",
    city: draft?.city ?? "",
  });

  const setField = (field: keyof OnboardingPreviewValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-hero border border-line bg-surface shadow-card lg:min-h-[min(76vh,760px)] lg:grid-cols-[0.95fr_1.05fr]">
      <OnboardingStage partnerMode={partnerMode} preview={values} />
      <OnboardingForm
        error={error}
        draft={draft}
        partnerMode={partnerMode}
        values={values}
        onField={setField}
      />
    </div>
  );
}
