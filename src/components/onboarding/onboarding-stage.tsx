import { OnboardingLinkScene } from "@/components/onboarding/onboarding-link-scene";

export function OnboardingStage() {
  return (
    <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden px-7 py-8 text-white sm:px-10 sm:py-10 lg:min-h-full">
      <div className="mesh-stage absolute inset-0" />
      <div className="stage-grain absolute inset-0 z-[1]" />

      <div className="relative z-10 animate-rise">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7eb8a4]" />
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
            Company registration
          </p>
        </div>
      </div>

      <div className="relative z-10 animate-rise-delay max-w-md py-8">
        <p className="font-display text-[clamp(2.4rem,4vw,3.4rem)] leading-[0.95] font-medium tracking-[-0.045em]">
          Create your
          <span className="mt-1 block text-white/50">company link.</span>
        </p>
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/68">
          One public page for your firm, case studies, and partners — visible
          only after both sides confirm.
        </p>
      </div>

      <div className="relative z-10 animate-rise-late">
        <OnboardingLinkScene />
      </div>
    </div>
  );
}
