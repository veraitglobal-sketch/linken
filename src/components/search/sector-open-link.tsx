"use client";

/**
 * Puts the sector name in the search field — Call center only while typing,
 * never as a sticky board over New on Hansala.
 */
export function SectorOpenLink({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const href = `/search?q=${encodeURIComponent(name)}`;
  return (
    <a
      href={href}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-4 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
    >
      {name}
      <span className="text-[13px] text-on-navy/70">See all →</span>
    </a>
  );
}
