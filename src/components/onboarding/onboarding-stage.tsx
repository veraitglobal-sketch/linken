export function OnboardingStage() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] px-6 py-6 text-white sm:px-7 sm:py-7">
      <div className="mesh-stage absolute inset-0" />
      <div className="stage-grain absolute inset-0" />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c4783a]" />
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/65 uppercase">
            Company registration
          </p>
        </div>
        <h2 className="mt-4 font-display text-[clamp(1.55rem,2.3vw,2.05rem)] font-medium leading-[1.05] tracking-[-0.04em]">
          Create your
          <span className="mt-1 block text-white/50">company link.</span>
        </h2>
        <p className="mt-2.5 max-w-sm text-[13px] leading-relaxed text-white/70">
          The public page for your firm, case studies, and mutually confirmed
          partners.
        </p>
      </div>

      <p className="relative z-10 mt-6 border-t border-white/15 pt-3 text-[11px] leading-relaxed text-white/55">
        One administrator · Required for partner confirmation · Visible after
        setup
      </p>
    </div>
  );
}
