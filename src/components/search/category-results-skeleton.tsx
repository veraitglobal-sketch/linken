/** The wait between picking a sector and the list arriving. */
export function CategoryResultsSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span aria-hidden className="size-2.5 animate-ping rounded-full bg-navy/60" />
        <p className="font-display text-[20px] font-semibold tracking-[-0.03em] text-ink">
          Searching confirmed companies…
        </p>
      </div>
      <ul className="mt-8 grid list-none gap-3 p-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className="flex h-[92px] items-center gap-4 rounded-[22px] bg-surface p-5 ring-1 ring-line/70"
          >
            <span className="size-11 animate-pulse rounded-2xl bg-mute" />
            <span className="size-14 animate-pulse rounded-2xl bg-mute" />
            <span className="flex-1 space-y-2">
              <span className="block h-4 w-1/3 animate-pulse rounded-full bg-mute" />
              <span className="block h-3 w-1/5 animate-pulse rounded-full bg-mute" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
