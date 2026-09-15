/**
 * What creating a group sets up, drawn with the viewer's own company: the
 * group on top, their company and an empty branch slot beneath. The slot is
 * labelled for what goes there — no invented firm.
 */
export function StructurePreview({ companyName }: { companyName: string }) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl bg-[#fafbf9] p-5 ring-1 ring-line/80">
        <p className="text-[12px] font-semibold tracking-[0.12em] text-muted uppercase">What you are creating</p>
        <div className="relative mt-5 flex flex-col items-center">
          <span className="flex h-11 items-center gap-2 rounded-full bg-surface pr-4 pl-1.5 ring-[1.5px] ring-navy/70">
            <span className="grid size-8 place-items-center rounded-full bg-lime text-navy">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="8.5" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <rect x="14" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M6.5 16v-4h11v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <span className="block text-[9px] leading-none font-semibold tracking-[0.14em] text-muted uppercase">Group</span>
              <span className="mt-1 block text-[13px] leading-none font-semibold text-ink">Your group name</span>
            </span>
          </span>
          <svg className="h-11 w-full text-[#b9c1bc]" viewBox="0 0 100 44" preserveAspectRatio="none" fill="none" aria-hidden>
            <path d="M50 0V22M25.5 22H74.5M25.5 22V44M74.5 22V44" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-[10px] bg-surface ring-1 ring-line">
              <p className="bg-navy px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.1em] text-white uppercase">Company</p>
              <p className="truncate px-2.5 py-2 text-[12px] font-semibold text-ink">{companyName}</p>
            </div>
            <div className="rounded-[10px] border border-dashed border-ink/25 bg-surface">
              <p className="px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.1em] text-muted uppercase">Subsidiary</p>
              <p className="px-2.5 pb-2 text-[12px] font-medium text-muted">Country branch</p>
            </div>
          </div>
        </div>
      </div>

      <ol className="space-y-3 rounded-2xl bg-surface p-5 ring-1 ring-line/80">
        {[
          ["Create the group", "The holding name your country firms sit under."],
          ["Add firms", "A new subsidiary, or a company that already has a Hansala profile."],
          ["Each keeps its own record", "Every branch has its own profile and evidence."],
        ].map(([title, body], i) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy text-[12px] font-semibold text-lime">{i + 1}</span>
            <span>
              <span className="block text-[14px] font-semibold text-ink">{title}</span>
              <span className="block text-[13px] leading-relaxed text-muted">{body}</span>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
