"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

export type RailSector = { slug: string; name: string; count: number };

/**
 * The left column of the board: every sector that has confirmed work.
 *
 * Counts are the real number of ranked companies, so a sector of one says one.
 * On a phone the column becomes a scrolling row above the body — the board
 * keeps its shape either way.
 */
export function SectorRail({
  sectors,
  activeSlug,
  onPick,
  hrefFor,
}: {
  sectors: RailSector[];
  activeSlug: string | null;
  /** Given, the rail acts in place instead of navigating. */
  onPick?: (slug: string) => void;
  hrefFor?: (slug: string) => string;
}) {
  const href = hrefFor ?? ((slug: string) => `/search?category=${slug}`);

  return (
    <div className="lg:sticky lg:top-3">
      <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        Sectors
      </p>
      <ul className="-mx-1 flex list-none gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
        {sectors.map((s) => {
          const active = s.slug === activeSlug;
          const inner = (
            <>
              <span className="truncate whitespace-nowrap">{s.name}</span>
              <span
                className={cn(
                  "text-[12.5px] tabular-nums",
                  active ? "text-lime" : "text-muted",
                )}
              >
                {s.count}
              </span>
            </>
          );
          const className = cn(
            "flex w-full shrink-0 items-center justify-between gap-3 rounded-full px-3.5 py-2.5 text-left text-[14px] font-semibold transition-colors lg:rounded-xl",
            active
              ? "bg-navy text-on-navy"
              : "bg-wash text-ink hover:bg-lime-soft lg:bg-transparent lg:hover:bg-wash",
          );
          return (
            <li key={s.slug} className="shrink-0 lg:shrink">
              {onPick ? (
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onPick(s.slug)}
                  className={className}
                >
                  {inner}
                </button>
              ) : (
                <Link href={href(s.slug)} aria-current={active ? "page" : undefined} className={className}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
