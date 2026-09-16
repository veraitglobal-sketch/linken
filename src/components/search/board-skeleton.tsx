/** The board while its rows are on the way — same chrome, no content yet. */
export function BoardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-[28px] bg-surface ring-1 ring-line/70">
      <div className="flex items-center gap-3 bg-navy px-4 py-3.5 sm:px-6">
        <span className="size-9 rounded-xl bg-on-navy/10" />
        <span className="h-4 w-40 animate-pulse rounded-full bg-on-navy/15" />
      </div>
      <div className="grid lg:grid-cols-[236px_1fr]">
        <div className="hidden space-y-2 border-r border-line/70 p-4 lg:block">
          {[0, 1, 2].map((i) => (
            <span key={i} className="block h-9 animate-pulse rounded-xl bg-mute" />
          ))}
        </div>
        <ul className="grid list-none gap-1 p-3 sm:p-4">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-3 px-2 py-2.5">
              <span className="size-9 animate-pulse rounded-xl bg-mute" />
              <span className="flex-1 space-y-2">
                <span className="block h-3.5 w-1/3 animate-pulse rounded-full bg-mute" />
                <span className="block h-3 w-1/5 animate-pulse rounded-full bg-mute" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
