import { WelcomeChecklistGrid } from "@/components/activation/welcome-checklist-grid";
import { WelcomeHero } from "@/components/activation/welcome-hero";
import { WelcomePrivacyNote } from "@/components/activation/welcome-privacy-note";
import { WelcomeQuickLinks } from "@/components/activation/welcome-quick-links";
import type { ActivationChecklist } from "@/features/activation/checklist";

type Props = {
  companySlug: string;
  companyName: string;
  checklist: ActivationChecklist;
  from?: "claim" | "confirm" | "onboarding";
};

export function WelcomeSetup({
  companySlug,
  companyName,
  checklist,
  from = "claim",
}: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <WelcomeHero
        companyName={companyName}
        companySlug={companySlug}
        checklist={checklist}
        from={from}
      />
      <WelcomeChecklistGrid steps={checklist.steps} />
      <WelcomePrivacyNote />
      <WelcomeQuickLinks companySlug={companySlug} />
    </div>
  );
}
