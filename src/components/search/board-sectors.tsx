"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BoardShell } from "@/components/search/board-shell";
import { RankedRow } from "@/components/search/board-rows";
import { SectorRail } from "@/components/search/sector-rail";
import type { CategoryLeaders } from "@/features/ranking/queries-showcase";
import { MIN_RANKED_FOR_POSITIONS } from "@/features/ranking/score";

/**
 * The board before anyone has searched: the field, sector by sector.
 *
 * It moves because the answer moves — a position is held by confirmed work and
 * lost when someone else confirms more. The moment a visitor picks a sector the
 * cycling stops: they are reading now. It also stops off-screen and under
 * reduced motion, and every company on it is a stored ranking row.
 */

const DWELL_MS = 5200;

export function BoardSectors({ groups }: { groups: CategoryLeaders[] }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(true);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), {
      threshold: 0.15,
    });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (held || !visible || groups.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % groups.length), DWELL_MS);
    return () => window.clearInterval(t);
  }, [held, visible, groups.length]);

  if (groups.length === 0) return <EmptyBoard />;

  const group = groups[Math.min(active, groups.length - 1)]!;
  /* Same rule as the lists: a sector this small is not a field, so nothing in
     it is numbered. The companies are real either way. */
  const numbered = group.total >= MIN_RANKED_FOR_POSITIONS;
  const top = group.leaders[0]?.points ?? 0;

  return (
    <div ref={hostRef}>
      <BoardShell
        title={group.name}
        subtitle={`${group.total} ${group.total === 1 ? "company" : "companies"} with confirmed work · worldwide`}
        actions={
          <Link
            href={`/search?category=${group.slug}`}
            className="inline-flex h-8 items-center rounded-full bg-lime px-3.5 text-[13px] font-semibold text-navy transition-colors hover:bg-lime/85"
          >
            Open this sector
          </Link>
        }
        rail={
          <SectorRail
            sectors={groups.map((g) => ({ slug: g.slug, name: g.name, count: g.total }))}
            activeSlug={group.slug}
            onPick={(slug) => {
              const i = groups.findIndex((g) => g.slug === slug);
              if (i >= 0) setActive(i);
              setHeld(true);
            }}
          />
        }
        status={
          <>
            <span>Ordered by work the other side confirmed.</span>
            <span>
              {numbered
                ? "Positions are earned, never sold."
                : `Positions appear once ${MIN_RANKED_FOR_POSITIONS} companies here have confirmed records.`}
            </span>
          </>
        }
      >
        <ol key={group.slug} className="animate-rise grid list-none gap-0.5 p-0">
          {group.leaders.map((company, i) => (
            <RankedRow
              key={company.slug}
              company={company}
              position={numbered ? i + 1 : null}
              share={group.leaders.length > 1 && top > 0 ? company.points / top : null}
            />
          ))}
        </ol>
      </BoardShell>
    </div>
  );
}

/** Before any sector has confirmed work in it — stated, not decorated. */
function EmptyBoard() {
  return (
    <BoardShell
      title="No sector has confirmed work yet"
      subtitle="The board fills as companies confirm each other"
      status={<span>A record appears here only after both companies agreed to it.</span>}
    >
      <div className="px-2 py-10 text-center">
        <p className="mx-auto max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
          Search a company by name above, or create your profile and invite the clients and
          partners who can confirm your work.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-navy px-5 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
        >
          Create your company profile
        </Link>
      </div>
    </BoardShell>
  );
}
