"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EmbedTestimonialCard } from "@/components/embed/embed-testimonial-card";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { useLogoWallActive } from "@/components/embed/use-logo-wall-active";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import {
  WALL_HEADER,
  WALL_LOCKUP,
  WALL_WINDOW,
  WALL_WINDOW_NARROW,
} from "@/features/testimonials/testimonial-height";
import type { PublicTestimonial } from "@/features/testimonials/types";

/**
 * The wall — columns of quotes drifting upward behind a soft top and bottom edge.
 *
 * Every other layout shows what fits; this one shows that there is more than
 * fits. The clipped height is the point: the reader is looking at a window onto
 * a longer list, not at a list that happens to end.
 *
 * The count is read from the container with a `ResizeObserver`, never from the
 * viewport. A wall drawn into a narrow host column on a wide screen would take
 * a viewport breakpoint as permission for four columns and overflow the host —
 * and in the script path there is no iframe to hide that.
 *
 * Motion is a courtesy on someone else's page: `useLogoWallActive` parks it
 * when the tab is hidden, when the wall is off-screen, and for anyone who asked
 * for reduced motion. Paused, it holds the first cards rather than a blank band.
 */

type Props = {
  items: PublicTestimonial[];
  profileUrl: string;
  /** Upper bound. The container decides the real count. */
  maxColumns: number;
  /** Clipped height of the window, px. Excludes the header above it. */
  height?: number;
  themeParam?: EmbedTheme;
};

const COL_MIN = 260;
const COL_GAP = 12;
/** Drift, in pixels per second. Slow enough to read a card as it passes. */
const SPEED = 20;
/**
 * Per-column speed multiplier.
 *
 * Duration is derived from the column's measured height, so every column would
 * otherwise drift at exactly `SPEED` and the wall would move as one sheet.
 * Counting cards instead of pixels does not work either: a column with fewer
 * cards gets a shorter duration, which cancels the multiplier almost exactly —
 * two columns came out at 30s and 29.475s that way, which is lockstep.
 */
const COLUMN_SPEED = [1, 0.72, 1.24, 0.88];

/* The loop translates by exactly -50%, so the doubled list has to be exactly
   two identical halves — including the space after the last card. Spacing lives
   on the item's margin rather than the list's `gap` for that reason: `gap`
   leaves 2n−1 gaps and the seam drifts by half a gap on every cycle. */
const KEYFRAMES = `
@keyframes hs-tm-wall-scroll {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
/* Hold still while someone is reading, or tabbing through. Marked important
   because the play state is an inline style and would otherwise win. This can
   only ever pause: nothing here starts an animation the component stopped. */
.hs-tm-wall:hover .hs-tm-wall-col,
.hs-tm-wall:focus-within .hs-tm-wall-col {
  animation-play-state: paused !important;
}
`;

function columnCount(width: number, max: number) {
  const fits = Math.floor((width + COL_GAP) / (COL_MIN + COL_GAP));
  return Math.max(1, Math.min(max, fits || 1));
}

/* Before paint on the client, plain effect on the server.
 *
 * `ResizeObserver` alone is not enough to get the first frame right. Its
 * callbacks are delivered in the rendering step, so on a page that is not being
 * rendered — a background tab, a host page opened in the background, this
 * preview pane — it never fires at all, and the wall sits at its initial guess
 * until someone looks at it. Measuring in a layout effect is not subject to
 * that: it runs on commit, visible or not, and before the browser paints, so
 * the count is right on the first frame instead of snapping one frame later. */
const useMeasureBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Round-robin, so column heights stay close whatever the quote lengths are. */
function toColumns(items: PublicTestimonial[], count: number) {
  const cols: PublicTestimonial[][] = Array.from({ length: count }, () => []);
  items.forEach((item, i) => cols[i % count]!.push(item));
  return cols.filter((c) => c.length);
}

export function EmbedTestimonialsWall({
  items,
  profileUrl,
  maxColumns,
  /* Derived, not a second literal. The iframe is sized from `testimonialHeight`
     and the content from this; two 560s in two files drift the day one changes,
     and the result is either a clipped wall or a band of dead space under it. */
  height = WALL_WINDOW,
  themeParam = "light",
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onScreen = useLogoWallActive(rootRef);
  const [cols, setCols] = useState(1);
  /* Every card is a link, and on a phone the reader is trying to hit a target
     that is sliding away from their thumb. A pointer over the wall stops it —
     which on touch fires the moment a finger lands, so the tap resolves against
     something standing still. It resumes when the finger leaves. */
  const [held, setHeld] = useState(false);
  const active = onScreen && !held;

  useMeasureBeforePaint(() => {
    const el = rootRef.current;
    if (!el) return;
    setCols(columnCount(el.clientWidth, maxColumns));

    if (typeof ResizeObserver === "undefined") return;
    /* Keeps up with a host that resizes its own column afterwards. */
    const ro = new ResizeObserver(([entry]) => {
      setCols(columnCount(entry?.contentRect.width ?? el.clientWidth, maxColumns));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxColumns]);

  if (!items.length) return null;

  const columns = toColumns(items, cols);
  /* A single column means a narrow container, whatever the viewport says. */
  const windowHeight = cols === 1 ? Math.min(height, WALL_WINDOW_NARROW) : height;

  return (
    <div
      ref={rootRef}
      className="hs-tm-wall relative w-full"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
    >
      <style>{KEYFRAMES}</style>

      {/* Above the mask, not inside it — a header behind that gradient would be
          faded out at exactly the point it is supposed to be read.

          Not wrapped in `hs-tm-attribution`: the guard reverts `display`, which
          would flatten the lockup's own flex row. It does not need the guard to
          be safe, because what the rule protects — the mark and the provenance —
          is on every card, guarded, below. This row states it once more at the
          top rather than being the only place it is stated. */}
      {/* `height` includes the padding, so the row itself is `WALL_LOCKUP` tall
          and the padding is the gap down to the first card. One constant still
          drives the iframe height, and the air cannot drift out of sync with it. */}
      <div
        className="flex items-center justify-between gap-4"
        style={{ height: WALL_HEADER, paddingBottom: WALL_HEADER - WALL_LOCKUP }}
      >
        {/* `lg`, not `md`: at 36px the mark inside the seal was a smudge. */}
        <EmbedVerifiedLockup theme={themeParam} size="lg" subtitle="Verified" />
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          /* The label was an 18px-tall hit area. The padding takes it to 44
             without moving the text: `self-end` plus the negative margin keeps
             the baseline where it was against the lockup. */
          className="flex min-h-11 shrink-0 items-center px-2 text-[10px] font-semibold tracking-[0.16em] uppercase no-underline opacity-55 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          style={{ color: "var(--hs-tm-muted)" }}
        >
          Testimonials
        </a>
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{
          height: windowHeight,
          display: "grid",
          gap: `${COL_GAP}px`,
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          /* Neutral fade, no colour of ours — it has to disappear into whatever
             background the host puts behind it. */
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 9%, #000 91%, transparent 100%)",
        }}
      >
        {columns.map((column, i) => (
          <Column
            key={i}
            items={column}
            profileUrl={profileUrl}
            active={active}
            speed={SPEED * (COLUMN_SPEED[i % COLUMN_SPEED.length] ?? 1)}
          />
        ))}
      </div>
    </div>
  );
}

function Column({
  items,
  profileUrl,
  active,
  speed,
}: {
  items: PublicTestimonial[];
  profileUrl: string;
  active: boolean;
  speed: number;
}) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [seconds, setSeconds] = useState(0);

  /* One cycle travels exactly one copy of the list, so the duration is that
     copy's height over the speed. Measured rather than estimated: card heights
     vary by 200px across a wall and a guess would put the columns back in step. */
  useMeasureBeforePaint(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => setSeconds(el.scrollHeight / 2 / speed);
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    /* `items` is a fresh array every render, so depending on it tore the
       observer down and rebuilt it on each one. The length is what can change
       the list; anything else that changes its height is what the observer is
       there for. */
  }, [speed, items.length]);

  /* The second pass is for the eye only. `inert` — not just `aria-hidden` —
     because these are links: hidden from a screen reader but still in the tab
     order, they would make a keyboard user tab through every card twice, the
     second time through cards that are not announced. */
  const loop = [...items, ...items];

  return (
    <div className="min-w-0 overflow-hidden">
      <ul
        ref={listRef}
        className="hs-tm-wall-col m-0 list-none p-0"
        style={{
          /* Longhand throughout. Mixing the `animation` shorthand with
             `animationPlayState` makes React warn on every re-render and diff
             the two against each other — it logged fifteen errors a page.
             Until the height is known there is nothing honest to animate, and a
             zero-second loop would flicker; it holds still for that one frame. */
          animationName: seconds ? "hs-tm-wall-scroll" : "none",
          animationDuration: `${seconds}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: active ? "running" : "paused",
          /* Only while it moves. A permanent compositor layer is a cost this
             widget would be charging to someone else's page for nothing. */
          willChange: active ? "transform" : "auto",
        }}
      >
        {loop.map((item, i) => (
          <li
            key={`${item.id}-${i}`}
            inert={i >= items.length || undefined}
            style={{ marginBottom: COL_GAP }}
          >
            <EmbedTestimonialCard item={item} profileUrl={profileUrl} quiet />
          </li>
        ))}
      </ul>
    </div>
  );
}
