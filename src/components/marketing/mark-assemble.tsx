"use client";

import { useEffect, useRef, useState } from "react";

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

/** Homepage §5a — the mark assembles once, on entry. Dark stage, mint mark.
 *
 * It used to be scroll-scrubbed inside an `h-[200vh]` runway: two screens of
 * scrolling to deliver one sentence, and the reader had to keep moving to hold
 * the picture together. Same choreography, played on its own. */
export function MarkAssemble() {
  const pin = useRef<HTMLDivElement>(null);
  const [rawForm, setForm] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = pin.current;
    if (!el || reduce) return;

    let raf = 0;
    let start = 0;
    const DURATION = 1400;

    const tick = (now: number) => {
      if (!start) start = now;
      const p = clamp((now - start) / DURATION, 0, 1);
      // ease-out cubic, so the pieces settle rather than snap
      setForm(1 - Math.pow(1 - p, 3));
      raf = p < 1 ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !raf && !start) {
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  /* Derived, not written from an effect — reduced motion holds the end state
     without a second render pass. */
  const form = reduce ? 1 : rawForm;

  const left = clamp(form / 0.35, 0, 1);
  const right = clamp((form - 0.15) / 0.35, 0, 1);
  const link = clamp((form - 0.4) / 0.35, 0, 1);
  const word = clamp((form - 0.65) / 0.35, 0, 1);

  return (
    <div ref={pin} className="relative">
      <div className="flex items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mark-stage relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-hero shadow-chapter">
          <div
            className="pointer-events-none absolute inset-0 stage-grain opacity-[0.4]"
            aria-hidden
          />
          <div className="relative flex min-h-[420px] flex-col items-center justify-center px-8 py-16 sm:py-20">
            <p className="mb-8 text-[11px] font-semibold tracking-[0.16em] text-blue-soft/80 uppercase">
              Two sides
            </p>
            <svg
              viewBox="0 0 200 80"
              className="h-16 w-[200px] text-blue-soft sm:h-[5.25rem] sm:w-[260px]"
              aria-hidden
            >
              <circle
                cx="36"
                cy="40"
                r="11"
                fill="currentColor"
                opacity={left}
                transform={`translate(${(1 - left) * -22} 0)`}
              />
              <circle
                cx="164"
                cy="40"
                r="11"
                fill="currentColor"
                opacity={right}
                transform={`translate(${(1 - right) * 22} 0)`}
              />
              <line
                x1="48"
                y1="40"
                x2="152"
                y2="40"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - link}
                opacity={0.25 + link * 0.75}
              />
            </svg>
            <div
              className="mt-9 text-center will-change-transform"
              style={{
                opacity: word,
                transform: `translateY(${(1 - word) * 14}px)`,
              }}
            >
              <p className="font-display text-chapter text-white">
                Hansala
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-white/50 sm:text-[15px]">
                Two companies. One confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
