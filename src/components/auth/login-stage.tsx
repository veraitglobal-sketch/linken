export function LoginStage() {
  return (
    <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden px-7 py-8 text-white sm:px-10 sm:py-10 lg:min-h-full">
      <div className="mesh-stage absolute inset-0" />
      <div className="stage-grain absolute inset-0 z-[1]" />

      <div className="relative z-10 animate-rise">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7eb8a4]" aria-hidden />
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#c5cdc8] uppercase">
            Company access
          </p>
        </div>
      </div>

      <div className="relative z-10 animate-rise-delay max-w-md py-8">
        <p className="font-display text-[clamp(2.4rem,4vw,3.4rem)] leading-[0.95] font-medium tracking-[-0.045em]">
          Sign in to
          <span className="mt-1 block text-[#c5cdc8]">your workspace.</span>
        </p>
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[#d4dbd6]">
          One owner per company. Manage the profile, case studies, and partner
          confirmations from a single place.
        </p>
      </div>

      <div className="relative z-10 animate-rise-late border-t border-white/15 pt-6">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9ec9b8] uppercase">
          After you enter
        </p>
        <p className="mt-3 font-display text-[clamp(1.25rem,2vw,1.55rem)] leading-snug tracking-[-0.03em] text-white">
          Profile. Partners. Proof of work.
        </p>
      </div>
    </div>
  );
}
