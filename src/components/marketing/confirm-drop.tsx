"use client";

import { useEffect, useRef, useState } from "react";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// landAt: fraction of the line's own width the ball centers on, overlapping
// the last couple letters. The final line drops its period entirely — the
// ball becomes that sentence's full stop instead of sitting on top of it.
const LINES = [
  {
    text: "Two companies.",
    indent: "pl-0",
    size: "sm" as const,
    landAt: 0.89,
  },
  {
    text: "One confirmation.",
    indent: "pl-10 sm:pl-16",
    size: "sm" as const,
    landAt: 0.9,
  },
  {
    text: "A public network",
    indent: "pl-28 sm:pl-44",
    size: "lg" as const,
    landAt: null,
  },
];

/** A ball falls from above onto a specific spot in each line, stepping down
 * the staircase as you scroll — a discrete drop-and-settle per line.
 * Reverses (falls back up) when you scroll back up. */
export function ConfirmDrop() {
  const ref = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ready, setReady] = useState(false);
  const [rotation, setRotation] = useState(0);
  const lastIndex = useRef(-1);

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

      const anchors = lineRefs.current.map((node, i) => {
        if (!node) return null;
        const landAt = LINES[i].landAt;
        const x =
          landAt === null
            ? node.offsetLeft + node.offsetWidth + 6
            : node.offsetLeft + node.offsetWidth * landAt;
        return { x, y: node.offsetTop + node.offsetHeight / 2 };
      });
      if (anchors.some((a) => a === null)) return;
      const points = anchors as { x: number; y: number }[];

      const idx = clamp(Math.round(progress * (LINES.length - 1)), 0, LINES.length - 1);

      if (idx !== lastIndex.current) {
        const steps = idx - lastIndex.current;
        setRotation((r) => r + steps * 300);
        lastIndex.current = idx;
      }

      setTarget(points[idx]);
      setActiveIndex(idx);
      setReady(true);
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

  const isLarge = activeIndex >= 0 && LINES[activeIndex].size === "lg";
  const ballSize = isLarge ? 20 : 12;

  return (
    <div ref={ref} className="relative mx-auto max-w-3xl">
      <span
        className="absolute z-10 overflow-hidden rounded-full bg-[#1a5c51] shadow-[0_2px_6px_rgba(8,20,18,0.35),0_0_0_5px_rgba(126,184,164,0.18)]"
        style={{
          width: ballSize,
          height: ballSize,
          left: target.x - ballSize / 2,
          top: (ready ? target.y : target.y - 40) - ballSize / 2,
          opacity: ready ? 1 : 0,
          transform: `rotate(${rotation}deg)`,
          transition: ready
            ? "left 480ms cubic-bezier(0.34, 1.56, 0.64, 1), top 480ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 480ms cubic-bezier(0.34, 1.56, 0.64, 1), width 300ms ease-out, height 300ms ease-out, opacity 300ms ease-out"
            : "none",
        }}
        aria-hidden
      >
        <span
          className="absolute rounded-full bg-[#7eb8a4]"
          style={{
            width: ballSize * 0.4,
            height: ballSize * 0.4,
            left: ballSize * 0.15,
            top: ballSize * 0.12,
          }}
        />
      </span>
      <p className="font-display text-[clamp(2.3rem,6.2vw,4.4rem)] font-medium leading-[1.12] tracking-[-0.048em]">
        {LINES.map((line, i) => {
          const distance = activeIndex < 0 ? 1 : Math.abs(activeIndex - i);
          const intensity = clamp(1 - distance, 0.16, 1);
          return (
            <span
              key={line.text}
              ref={(node) => {
                lineRefs.current[i] = node;
              }}
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
