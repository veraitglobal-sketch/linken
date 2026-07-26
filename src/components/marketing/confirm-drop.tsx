"use client";

import { useEffect, useRef, useState } from "react";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const LINES = [
  { text: "Two companies.", indent: "pl-0" },
  { text: "One confirmation.", indent: "pl-8 sm:pl-14" },
  { text: "A public network.", indent: "pl-16 sm:pl-28" },
];

/** Each line brightens in turn as you scroll past — discrete steps. */
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
      const start = vh * 0.78;
      const end = vh * 0.32;
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
    <div ref={ref} className="relative">
      <p className="font-display text-[clamp(2.4rem,6.4vw,4.5rem)] font-medium leading-[1.1] tracking-[-0.05em]">
        {LINES.map((line, i) => {
          const distance = activeIndex < 0 ? 1 : Math.abs(activeIndex - i);
          const intensity = clamp(1 - distance * 0.72, 0.14, 1);
          return (
            <span
              key={line.text}
              className={`mt-2.5 block transition-[color,transform] duration-300 first:mt-0 ${line.indent}`}
              style={{
                color: `rgba(13, 18, 16, ${intensity})`,
                transform:
                  activeIndex === i ? "translateX(0)" : "translateX(-2px)",
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
