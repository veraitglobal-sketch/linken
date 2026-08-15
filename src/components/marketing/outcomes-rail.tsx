"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  OutcomeGlyph,
  type GlyphKind,
} from "@/components/marketing/outcome-glyph";
import { cn } from "@/lib/cn";

const REDUCED = "(prefers-reduced-motion: reduce)";
const DWELL = 2600;

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export type OutcomeStop = {
  title: string;
  body: string;
  checker: string;
  glyph: GlyphKind;
};

/**
 * Each row is the mark.
 *
 * Hansala's mark is two nodes and a link. Every row here has exactly two
 * sides — you on the left, whoever checks you on the right — so the row is
 * drawn as the mark itself: a node at each end and a link that draws between
 * them when the row comes live. Four rows, four different second parties, the
 * same mark each time. The section performs the confirmation instead of
 * describing it, and no competitor can copy the device without copying the
 * mark.
 *
 * The link doubles as the leader rule of a book index, which is what a
 * register's contents page should look like.
 *
 * Nothing opens or closes: the link is a transform, so the row height never
 * changes and the page below never moves. Reduced motion draws every link and
 * stops cycling.
 */
export function OutcomesRail({ stops }: { stops: readonly OutcomeStop[] }) {
  const ref = useRef<HTMLOListElement | null>(null);
  const [active, setActive] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  /* Read through the store: syncing a media query into state inside an effect
     cascades a render and the linter rejects it. */
  const still = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!onScreen || still) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % stops.length),
      DWELL,
    );
    return () => window.clearInterval(id);
  }, [onScreen, still, stops.length]);

  return (
    <ol ref={ref} className="m-0 list-none p-0">
      {stops.map((stop, i) => {
        const lit = still || i === active;
        return (
          <li
            key={stop.title}
            className="flex items-start gap-6 border-t border-line py-8 last:border-b sm:gap-9 lg:py-9"
          >
            <OutcomeGlyph
              kind={stop.glyph}
              live={lit}
              className={cn(
                "size-[68px] transition-opacity duration-500 sm:size-[84px]",
                lit ? "opacity-100" : "opacity-45",
              )}
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3
                  className={cn(
                    "font-display text-[26px] leading-none font-medium tracking-[-0.035em] transition-colors duration-500 sm:text-[30px]",
                    lit ? "text-ink" : "text-ink/45",
                  )}
                >
                  {stop.title}
                </h3>
                <p
                  className={cn(
                    "shrink-0 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-500",
                    lit ? "text-blue" : "text-muted/70",
                  )}
                >
                  {stop.checker}
                </p>
              </div>

              <p className="mt-3.5 max-w-[62ch] text-[14.5px] leading-relaxed text-muted">
                {stop.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
