/** The wait between picking a place and seeing the list. */
export default function Loading() {
  return (
    <div className="home-wash bg-wash">
      <section className="relative -mt-[4.25rem] px-4 pt-[8rem] sm:px-6 sm:pt-[9rem] lg:px-8">
        <div aria-hidden className="absolute inset-x-0 top-0 bottom-10 rounded-b-[48px] bg-lime sm:rounded-b-[120px]" />
        <div className="relative mx-auto flex max-w-[1180px] items-center gap-3">
          <span aria-hidden className="size-2.5 animate-ping rounded-full bg-navy/60" />
          <p className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
            Searching confirmed companies…
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-[1180px] px-4 pt-12 pb-24 sm:px-[18px]">
        <ul className="grid list-none gap-3 p-0">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="flex h-[92px] items-center gap-4 rounded-[22px] bg-surface p-5 ring-1 ring-line/70">
              <span className="size-11 animate-pulse rounded-2xl bg-mute" />
              <span className="size-14 animate-pulse rounded-2xl bg-mute" />
              <span className="flex-1 space-y-2">
                <span className="block h-4 w-1/3 animate-pulse rounded-full bg-mute" />
                <span className="block h-3 w-1/5 animate-pulse rounded-full bg-mute" />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
