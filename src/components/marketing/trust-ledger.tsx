"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { TrustEvidenceLine } from "@/features/trust/score";

type Props = {
  points: number;
  level: string;
  lines: TrustEvidenceLine[];
};

/** Hairline drawing grid — the sheet the record is set on. */
const RULED_SHEET =
  "repeating-linear-gradient(to right,rgba(255,255,255,0.032) 0 1px,transparent 1px 88px)," +
  "repeating-linear-gradient(to bottom,rgba(255,255,255,0.032) 0 1px,transparent 1px 88px)";

const ROW_STAGGER = 140;

/**
 * Each row draws the mark's own grammar — node, link, node — at a width set by
 * what the line is worth. The link is made left to right and the far node lands
 * once it arrives: a record exists only after the other side is reached.
 *
 * Markup renders drawn, so the points survive no JS, a dead observer or reduced
 * motion. Hydration sets `data-armed` to collapse before the first paint, and
 * entering the viewport removes it — which is what plays the animation.
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

        <div className="mt-7 flex items-end gap-4">
          <p className="font-display text-[clamp(3.4rem,7vw,4.75rem)] leading-[0.82] font-medium tracking-[-0.055em] text-white tabular-nums">
            {points}
          </p>
          <p className="pb-1.5 text-[13px] leading-snug text-white/55">
            points, from
            <br />
            confirmed evidence only
          </p>
        </div>
        <p className="mt-4 font-display text-[1.35rem] font-medium tracking-[-0.03em] text-white">
          Hansala {level}
        </p>

        <ul className="mt-8 border-t border-white/10">
          {lines.map((line, index) => (
            <li
              key={line.key}
              className="flex items-center gap-4 border-b border-white/10 py-3"
              style={
                {
                  "--link-w": `${(line.points / widest) * 56 + 16}px`,
                  "--link-delay": `${index * ROW_STAGGER}ms`,
                } as CSSProperties
              }
            >
              <span className="min-w-0 flex-1 text-[13px] leading-snug text-white/70">
                {line.label}
              </span>

              <span
                className="relative flex w-[var(--link-w)] shrink-0 items-center"
                aria-hidden
              >
                <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-[#7eb8a4]/70 transition-[width] duration-[520ms] ease-out [transition-delay:calc(var(--link-delay)+120ms)] group-data-armed/ledger:w-0 motion-reduce:transition-none" />
                <span className="relative h-[5px] w-[5px] shrink-0 scale-100 rounded-full bg-[#7eb8a4] transition-transform duration-200 ease-out [transition-delay:var(--link-delay)] group-data-armed/ledger:scale-0 motion-reduce:transition-none" />
                <span className="relative ml-auto h-[5px] w-[5px] shrink-0 scale-100 rounded-full bg-[#7eb8a4] transition-transform duration-200 ease-out [transition-delay:calc(var(--link-delay)+600ms)] group-data-armed/ledger:scale-0 motion-reduce:transition-none" />
              </span>

              <span className="w-7 shrink-0 text-right text-[12px] text-[#7eb8a4] tabular-nums opacity-100 transition-opacity duration-500 ease-out [transition-delay:calc(var(--link-delay)+640ms)] group-data-armed/ledger:opacity-0 motion-reduce:transition-none">
                +{line.points}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-white/50">
          Nothing on this list can be self-reported. Every line is a record the
          other company clicked.
        </p>
      </div>
    </div>
  );
}
