"use client";

import { LoginStage } from "@/components/auth/login-stage";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import type { OnboardingDraft } from "@/features/company/onboarding-draft";

type Props = {
  error?: string;
  draft?: OnboardingDraft | null;
  partnerMode?: boolean;
  /** Signed-in account, or null when the visitor has no account yet. */
  accountEmail: string | null;
};

/** Full-screen split, same shape as sign-in: brand on navy, a short stepped form. */
export function OnboardingWorkspace({
  error,
  draft = null,
  partnerMode = false,
  accountEmail,
}: Props) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <div className="hidden lg:block">
        <LoginStage />
      </div>
      <OnboardingForm
        error={error}
        draft={draft}
        partnerMode={partnerMode}
        accountEmail={accountEmail}
      />
    </div>
  );
}
