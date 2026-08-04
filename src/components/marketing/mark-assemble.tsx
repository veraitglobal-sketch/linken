"use client";

import { useEffect, useRef, useState } from "react";

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

/** Triangle 0→1→0 across scroll progress — assemble, then come apart. */
function pingPong(p: number) {
  return p < 0.5 ? p * 2 : 2 - p * 2;
}

/**
 * Scroll drives the mark: forms, then opens again.
 * Dark stage, mint mark — scrubbed, reversible.
 */
export function MarkAssemble() {
  const pin = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(0);
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
    if (!el) return;
    if (reduce) {
      setForm(1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const raw = clamp(-rect.top / travel, 0, 1);
      setForm(pingPong(raw));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const left = clamp(form / 0.35, 0, 1);
  const right = clamp((form - 0.15) / 0.35, 0, 1);
  const link = clamp((form - 0.4) / 0.35, 0, 1);
  const word = clamp((form - 0.65) / 0.35, 0, 1);

  return (
    <div ref={pin} className="relative h-[220vh]">
      <div className="sticky top-0 flex min-h-[100svh] items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mark-stage relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-[32px]">
          <div
            className="pointer-events-none absolute inset-0 stage-grain opacity-[0.4]"
            aria-hidden
          />

          <div className="relative flex min-h-[min(70vh,520px)] flex-col items-center justify-center px-8 py-16 sm:py-20">
            <svg
              viewBox="0 0 200 80"
              className="h-16 w-[200px] text-[#7eb8a4] sm:h-[5.25rem] sm:w-[260px]"
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
              <p className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium tracking-[-0.045em] text-white">
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
