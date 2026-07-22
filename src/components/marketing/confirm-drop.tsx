"use client";

import { useEffect, useRef, useState } from "react";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const LINES = [
  { text: "Two companies.", indent: "pl-0" },
  { text: "One confirmation.", indent: "pl-10 sm:pl-16" },
  { text: "A public network", indent: "pl-28 sm:pl-44" },
];

/** Each line brightens in turn as you scroll past it — a discrete step per
 * line, reversing as you scroll back up. */
export function ConfirmDrop() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const end = vh * 0.3;
      const progress = clamp((start - rect.top) / (start - end), 0, 1);
      setActiveIndex(
        clamp(Math.round(progress * (LINES.length - 1)), 0, LINES.length - 1),
      );
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
  }, []);

  return (
    <div ref={ref} className="relative mx-auto max-w-3xl">
      <p className="font-display text-[clamp(2.3rem,6.2vw,4.4rem)] font-medium leading-[1.12] tracking-[-0.048em]">
        {LINES.map((line, i) => {
          const distance = activeIndex < 0 ? 1 : Math.abs(activeIndex - i);
          const intensity = clamp(1 - distance, 0.16, 1);
          return (
            <span
              key={line.text}
              className={`mt-3 block transition-colors duration-300 first:mt-0 ${line.indent}`}
              style={{
                color: `rgba(13, 18, 16, ${intensity})`,
              }}
            >
              {line.text}
            </span>
          );
        })}
      </p>
    </div>
  );
}
