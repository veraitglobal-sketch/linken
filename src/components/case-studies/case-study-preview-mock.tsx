/** Static mock — shows the public case study layout in the create studio. */
export function CaseStudyPreviewMock() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-navy shadow-[0_22px_56px_rgba(8,20,18,0.18)]">
      <div className="relative aspect-[16/10] bg-[#142a25]">
        <div className="stage-grain absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081412] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-white/45 uppercase">
            Case study · 2025
          </p>
          <p className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-white">
            Your project title
          </p>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="h-2 w-4/5 rounded-full bg-white/10" />
        <div className="h-2 w-full rounded-full bg-white/8" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/6 p-3">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-ember uppercase">
              Challenge
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10" />
          </div>
          <div className="rounded-xl bg-white/6 p-3">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-ember uppercase">
              Outcome
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-lg bg-white/8" />
          ))}
        </div>
      </div>
    </div>
  );
}
