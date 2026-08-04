"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { TrustEvidenceLine } from "@/features/trust/score";

type Props = {
  points: number;
  level: string;
  lines: TrustEvidenceLine[];
};

/** Faint drawing texture — sits under the record, never competes with it. */
const RULED_SHEET =
  "repeating-linear-gradient(to right,rgba(255,255,255,0.022) 0 1px,transparent 1px 88px)," +
  "repeating-linear-gradient(to bottom,rgba(255,255,255,0.022) 0 1px,transparent 1px 88px)";

const ROW_STAGGER = 130;

/**
 * Every row is one confirmed relationship, drawn the way the mark is drawn:
 * a node, a link, a node. The link crosses the whole row so the gesture is
 * legible, and how far the mint reaches is what the line is worth — the track
 * behind it is the distance a full-weight record would travel.
 *
 * Markup renders finished, so the points survive no JS, a dead observer or
 * reduced motion. Hydration sets `data-armed` to collapse before the first
 * paint; entering the viewport removes it, and that is what plays the draw.
 */
export function TrustLedger({ points, level, lines }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widest = Math.max(...lines.map((line) => line.points), 1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.armed = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          delete el.dataset.armed;
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group/ledger relative bg-[linear-gradient(155deg,#12241f_0%,#0b1815_58%,#081412_100%)] p-8 sm:p-10 lg:p-12"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: RULED_SHEET }}
        aria-hidden
      />

      <div className="relative">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase">
          How the level is earned
        </p>

        <div className="mt-7 flex items-baseline gap-5">
          <p className="font-display text-[clamp(3.4rem,7vw,4.75rem)] leading-[0.8] font-medium tracking-[-0.055em] text-white tabular-nums">
            {points}
          </p>
          <p className="font-display text-[clamp(1.25rem,2vw,1.6rem)] font-medium tracking-[-0.035em] text-white">
            Hansala {level}
          </p>
        </div>
        <p className="mt-3 text-[13px] text-white/50">
          points, from confirmed evidence only
        </p>

        <ul className="mt-9 border-t border-white/10">
          {lines.map((line, index) => (
            <li
              key={line.key}
              className="grid grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-x-5 border-b border-white/10 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(120px,0.85fr)_2.25rem]"
              style={
                {
                  "--reach": `${(line.points / widest) * 100}%`,
                  "--link-delay": `${index * ROW_STAGGER}ms`,
                } as CSSProperties
              }
            >
              <span className="min-w-0 text-[13px] leading-snug text-white/70">
                {line.label}
              </span>

              {/* Track is the full-weight distance; the mint is this line's. */}
              {/* Below sm the cell collapses to ~88px, where the gesture has
                  nowhere to travel — the row keeps label and points only. */}
              <span
                className="relative hidden h-[7px] items-center sm:flex"
                aria-hidden
              >
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
                <span
                  className="absolute top-1/2 left-0 h-px w-[var(--reach)] -translate-y-1/2 bg-[#7eb8a4] transition-[width] duration-[720ms] ease-out [transition-delay:calc(var(--link-delay)+110ms)] group-data-armed/ledger:w-0 motion-reduce:transition-none"
                >
                  <span className="absolute top-1/2 -right-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-[#7eb8a4] shadow-[0_0_0_3px_rgba(126,184,164,0.16)]" />
                </span>
                <span className="absolute top-1/2 left-0 h-[5px] w-[5px] -translate-y-1/2 scale-100 rounded-full bg-[#7eb8a4] transition-transform duration-200 ease-out [transition-delay:var(--link-delay)] group-data-armed/ledger:scale-0 motion-reduce:transition-none" />
              </span>

              <span className="text-right text-[12px] text-[#7eb8a4] tabular-nums opacity-100 transition-opacity duration-500 ease-out [transition-delay:calc(var(--link-delay)+660ms)] group-data-armed/ledger:opacity-0 motion-reduce:transition-none">
                +{line.points}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-7 max-w-sm text-[13px] leading-relaxed text-white/50">
          Nothing on this list can be self-reported. Every line is a record the
          other company clicked.
        </p>
      </div>
    </div>
  );
}
