"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import type { CategoryLeaders } from "@/features/ranking/queries-showcase";
import { MIN_RANKED_FOR_POSITIONS } from "@/features/ranking/score";
import { cn } from "@/lib/cn";

/**
 * Who leads each sector right now, one sector at a time.
 *
 * It moves because the answer moves: a position here is held by confirmed work
 * and lost when someone else confirms more. Everything on screen is a stored
 * ranking row — there is no filler sector and no placeholder company.
 *
 * Rotation stops the moment a visitor picks a sector: they are reading now, not
 * being shown a carousel. It also stops off-screen and under reduced motion.
 */

const DWELL_MS = 5200;

export function PositioningShowcase({ groups }: { groups: CategoryLeaders[] }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(true);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.2 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (held || !visible || groups.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(
      () => setActive((i) => (i + 1) % groups.length),
      DWELL_MS,
    );
    return () => window.clearInterval(t);
  }, [held, visible, groups.length]);

  if (groups.length === 0) return null;
  const group = groups[Math.min(active, groups.length - 1)]!;
  /* Same rule as the lists: a sector this small is not a field, so nothing here
     is numbered. The companies are still real and still shown. */
  const numbered = group.total >= MIN_RANKED_FOR_POSITIONS;

  return (
    <div ref={hostRef} className="overflow-hidden rounded-[28px] bg-surface ring-1 ring-line/70">
      <div className="flex flex-col lg:grid lg:grid-cols-[260px_1fr]">
        <div className="border-b border-line/70 p-4 lg:border-r lg:border-b-0 lg:p-5">
          <p className="px-1 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Sectors with confirmed work
          </p>
          <ul
            className="mt-3 flex list-none gap-2 overflow-x-auto p-0 lg:grid lg:gap-1 lg:overflow-visible"
            role="tablist"
            aria-label="Sectors"
          >
            {groups.map((g, i) => (
              <li key={g.slug} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => {
                    setActive(i);
                    setHeld(true);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-full px-4 py-2.5 text-left text-[14px] font-semibold transition-colors lg:rounded-2xl",
                    i === active
                      ? "bg-navy text-on-navy"
                      : "bg-wash text-ink hover:bg-lime-soft lg:bg-transparent lg:hover:bg-wash",
                  )}
                >
                  <span className="whitespace-nowrap">{g.name}</span>
                  <span
                    className={cn(
                      "text-[13px] tabular-nums",
                      i === active ? "text-lime" : "text-muted",
                    )}
                  >
                    {g.total}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div key={group.slug} className="animate-rise p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[26px]">
                {group.name}
              </h2>
              <p className="mt-1 text-[14px] text-ink-soft">
                {group.total} {group.total === 1 ? "company" : "companies"} with confirmed
                work · worldwide
                {numbered ? "" : " · positions appear at five"}
              </p>
            </div>
            <Link
              href={`/search?mode=categories&category=${group.slug}`}
              className="inline-flex h-10 items-center rounded-full bg-lime px-4 text-[14px] font-semibold text-navy transition-colors hover:bg-lime/80"
            >
              See the full list
            </Link>
          </div>

          <ol className="mt-5 grid list-none gap-2 p-0">
            {group.leaders.map((company, i) => (
              <li key={company.slug}>
                <Link
                  href={`/c/${company.slug}?src=ranking`}
                  className="group flex items-center gap-3 rounded-2xl bg-wash px-3 py-3 transition-colors hover:bg-lime-soft sm:gap-4 sm:px-4"
                >
                  {numbered ? (
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl font-display text-[15px] font-semibold tabular-nums",
                        i === 0 ? "bg-navy text-lime" : "bg-surface text-ink",
                      )}
                    >
                      {i + 1}
                    </span>
                  ) : null}
                  <LogoMark
                    initials={company.logoInitials}
                    logoUrl={company.logoUrl}
                    size="sm"
                    className="rounded-xl! bg-surface"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[16px] font-semibold tracking-[-0.025em] text-ink">
                      {company.name}
                    </span>
                    <span className="block truncate text-[13px] text-muted">
                      {[company.city, company.country].filter(Boolean).join(", ") ||
                        `${company.distinctPartners} confirmed ${company.distinctPartners === 1 ? "company" : "companies"}`}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-[13px] text-ink-soft sm:block">
                    {company.distinctPartners} confirmed
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
