"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  HomePill,
  HomeTitle,
} from "@/components/marketing/home-section";
import {
  ArtProcurement,
  ArtProposals,
  ArtSales,
  ArtTenders,
} from "@/components/marketing/home-moments-art";
import { cn } from "@/lib/cn";

const MOMENTS = [
  {
    title: "Proposals",
    body: "Attach a confirmed reference list or one-pager. The client checks every record before the first meeting.",
  },
  {
    title: "Tenders",
    body: "Answer reference requirements with records the other side confirmed — not a list you wrote yourself.",
  },
  {
    title: "Sales",
    body: "Prospects see who you have actually delivered for on your public profile — before the first call.",
  },
  {
    title: "Procurement",
    body: "A vendor check resolves to a plain answer: a confirmed record, or no file. Never a paid badge.",
  },
] as const;

const ART: readonly ReactNode[] = [
  <ArtProposals key="p" />,
  <ArtTenders key="t" />,
  <ArtSales key="s" />,
  <ArtProcurement key="v" />,
];


/**
 * Homepage §6 — the four moments work is won, as a centred carousel.
 * Wide white cards, the neighbours peeking in at both edges, arrows and a
 * pill pager beneath. Scroll-snap does the paging; the controls only scroll.
 */
export function HomeMoments() {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = useCallback((i: number) => {
    const el = trackRef.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, []);

  /* Open on the second card, so a neighbour shows at both edges. */
  useEffect(() => {
    const el = trackRef.current;
    const card = el?.children[1] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      [...el.children].forEach((c, i) => {
        const n = c as HTMLElement;
        const d = Math.abs(n.offsetLeft + n.offsetWidth / 2 - mid);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setIndex(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) =>
    scrollTo(Math.max(0, Math.min(MOMENTS.length - 1, i)));

  return (
    <section className="py-14 sm:py-[75px]">
      <div className="px-4 text-center sm:px-[18px]">
        <HomeTitle>Where a confirmed record wins the work</HomeTitle>
        <p className="mx-auto mt-6 max-w-[62ch] text-[18px] leading-relaxed text-ink-soft">
          For AEC, specialist contractors, agencies and consulting — every line
          checked by the other side.
        </p>
      </div>

      <ul
        ref={trackRef}
        className="mt-12 flex snap-x snap-mandatory list-none gap-6 overflow-x-auto px-[max(1rem,calc(50%-302px))] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {MOMENTS.map((m, i) => (
          <li
            key={m.title}
            className="flex w-[86vw] max-w-[605px] shrink-0 snap-center flex-col overflow-hidden rounded-3xl bg-white sm:h-[400px]"
            aria-current={i === index ? "true" : undefined}
          >
            <div className="px-7 pt-7">
              <h3 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.025em] text-ink">
                {m.title}
              </h3>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">
                {m.body}
              </p>
            </div>
            <div className="mx-7 mt-6 flex flex-1 items-end overflow-hidden rounded-t-2xl bg-lime-soft">
              {ART[i]}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center justify-center gap-3">
        <Arrow dir={-1} onClick={() => go(index - 1)} disabled={index === 0} />
        <div className="flex h-11 items-center gap-2 rounded-full bg-white/60 px-3 ring-1 ring-white">
          {MOMENTS.map((m, i) => (
            <button
              key={m.title}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${m.title}`}
              className="grid h-11 place-items-center"
            >
              <span
                className={cn(
                  "block h-2.5 rounded-full transition-[width,background-color] duration-300",
                  i === index ? "w-16 bg-navy" : "w-2.5 bg-ink/20",
                )}
              />
            </button>
          ))}
        </div>
        <Arrow
          dir={1}
          onClick={() => go(index + 1)}
          disabled={index === MOMENTS.length - 1}
        />
      </div>

      <div className="mt-12 flex justify-center px-4">
        <HomePill href="/onboarding">Create your free profile</HomePill>
      </div>
    </section>
  );
}

function Arrow({
  dir,
  onClick,
  disabled,
}: {
  dir: -1 | 1;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === -1 ? "Previous" : "Next"}
      className="grid size-11 place-items-center rounded-full bg-white/60 text-navy ring-1 ring-white transition-opacity disabled:opacity-40"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d={dir === -1 ? "M13 8H3m4-4L3 8l4 4" : "M3 8h10M9 4l4 4-4 4"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
