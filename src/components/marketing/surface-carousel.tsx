"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SurfaceGlyph,
  type SurfaceGlyphKind,
} from "@/components/marketing/surface-glyph";
import { cn } from "@/lib/cn";

export type Surface = {
  title: string;
  body: string;
  /** The route or endpoint behind it — every card names something real. */
  source: string;
  glyph: SurfaceGlyphKind;
};

/**
 * Three plates, cycled. Retell reuses a single tile across all seven cards,
 * which reads as a template; three is enough that the two cards in view never
 * share one (1,2,3,1,2,3 — no neighbour repeats).
 *
 * Ink diffusion rather than the macro-glass set that briefly replaced it:
 * sharper is not warmer, and four near-identical glass edges sat colder
 * against the rest of the page than these do.
 */
/** Matches the `gap-5` on the track. */
const GAP = 20;

/* Renamed from `tile-N`: the glass set had shipped under those exact names,
   so browsers and the image optimiser kept serving the cached bytes after the
   files were replaced. A new path is the only reliable bust. */
const TILES = [
  "/images/plate-ink-1.webp",
  "/images/plate-ink-2.webp",
  "/images/plate-ink-3.webp",
];

/**
 * The surfaces a confirmed record renders on.
 *
 * Retell's carousel: two cards in view, a gradient tile per card, arrows, an
 * `n — total` counter and a rule that fills. Same mechanic, our material — and
 * the badge sits in CSS rather than baked into the plate, so each card carries
 * its own glyph and the colours stay on the tokens.
 *
 * Scroll-snap does the paging, so the track stays keyboard- and touch-native;
 * the arrows only scroll it. No layout shifts and no library.
 */
export function SurfaceCarousel({ surfaces }: { surfaces: readonly Surface[] }) {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);

  /** Card pitch and how many fit — both change with the breakpoint. */
  const metrics = useCallback(() => {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return null;
    const step = card.getBoundingClientRect().width + GAP;
    return {
      el,
      step,
      fits: Math.max(1, Math.round((el.clientWidth + GAP) / step)),
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      const m = metrics();
      if (!m) return;
      setPerView(m.fits);
      setIndex((i) => Math.min(i, Math.max(0, surfaces.length - m.fits)));
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [metrics, surfaces.length]);

  /* Scroll to an exact offset rather than nudging by one card. `scrollBy`
     with smooth behaviour fights scroll-snap — the snap interrupts the
     animation and the track lands between two cards, which is why it stopped
     halfway and never returned to the start. */
  useEffect(() => {
    const m = metrics();
    if (!m) return;
    m.el.scrollTo({ left: index * m.step, behavior: "smooth" });
  }, [index, metrics]);

  /* Stop where the track stops. Running the index to `length - 1` lets the
     browser clamp the last two steps to the same scroll offset, so two
     different numbers show the identical pair of cards — Retell's carousel
     does exactly this between 6 — 7 and 7 — 7. Capping at `length - perView`
     makes every position show something new. */
  const maxIndex = Math.max(0, surfaces.length - perView);
  const go = (dir: -1 | 1) =>
    setIndex((i) => Math.min(maxIndex, Math.max(0, i + dir)));

  const atStart = index === 0;
  const atEnd = index >= maxIndex;
  /* The visible range, so the last card still gets its number without a
     duplicate position: 1–2, 2–3 … 5–6. */
  const first = index + 1;
  const last = Math.min(surfaces.length, index + perView);

  return (
    <div>
      <ul
        ref={trackRef}
        className="m-0 flex snap-x snap-mandatory list-none gap-5 overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {surfaces.map((s, i) => (
          <li
            key={s.title}
            className="w-[86%] shrink-0 snap-start sm:w-[62%] lg:w-[calc(50%-10px)]"
          >
            <article className="flex h-full flex-col gap-6 rounded-chapter bg-mute p-5 sm:flex-row sm:items-stretch sm:gap-7 sm:p-6">
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-8">
                <h3 className="font-display text-[21px] leading-snug font-medium tracking-[-0.03em] text-ink text-balance">
                  {s.title}
                </h3>
                <div>
                  <p className="text-[14px] leading-relaxed text-muted">
                    {s.body}
                  </p>
                  <p className="mt-3 font-mono text-[11px] tracking-[-0.01em] text-muted/80">
                    {s.source}
                  </p>
                </div>
              </div>

              {/* The plate, with the badge in CSS so the glyph can differ. */}
              <div
                className="relative aspect-square w-full shrink-0 overflow-hidden rounded-card bg-navy bg-cover bg-center sm:w-[46%]"
                style={{ backgroundImage: `url(${TILES[i % TILES.length]})` }}
              >
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid size-[38%] place-items-center rounded-full bg-white/95 shadow-[0_8px_24px_-8px_rgba(8,20,18,0.5)]">
                    <SurfaceGlyph kind={s.glyph} className="size-[56%]" />
                  </div>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center gap-5">
        <div className="flex gap-2">
          <Arrow dir={-1} onClick={() => go(-1)} disabled={atStart} />
          <Arrow dir={1} onClick={() => go(1)} disabled={atEnd} />
        </div>
        <p className="shrink-0 text-[12px] tabular-nums text-muted">
          {first}
          {last > first ? `\u2013${last}` : ""}{" "}
          <span className="px-1 text-muted/60">—</span> {surfaces.length}
        </p>
        <span className="relative h-px flex-1 bg-line" aria-hidden>
          <span
            className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-500 ease-out"
            style={{ width: `${(last / surfaces.length) * 100}%` }}
          />
        </span>
      </div>
    </div>
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
      aria-label={dir === -1 ? "Previous surface" : "Next surface"}
      className={cn(
        "grid size-11 place-items-center rounded-card transition-colors duration-200",
        disabled
          ? "bg-line/60 text-muted/50"
          : "bg-accent text-on-navy hover:bg-accent-hover",
      )}
    >
      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d={dir === -1 ? "M7.5 2 3.5 6l4 4" : "M4.5 2l4 4-4 4"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
