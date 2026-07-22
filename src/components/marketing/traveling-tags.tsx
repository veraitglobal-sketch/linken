"use client";

import { useEffect, useRef, useState } from "react";

/** A signal travels the route from tag to tag, pulsing each in turn — "your
 * network travels with every share" made literal, not just decorative. */
export function TravelingTags({ items }: { items: string[] }) {
  const [active, setActive] = useState(0);
  const [dot, setDot] = useState({ x: 0, y: 0 });
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const railRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, 1400);
    return () => clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    const node = itemRefs.current[active];
    const rail = railRef.current;
    if (!node || !rail) return;
    setDot({
      x: node.offsetLeft + node.offsetWidth / 2,
      y: node.offsetTop + node.offsetHeight / 2,
    });
  }, [active]);

  return (
    <div className="relative mt-8">
      <ul ref={railRef} className="relative flex flex-wrap gap-2">
        {items.map((place, i) => {
          const lit = i === active;
          return (
            <li
              key={place}
              ref={(node) => {
                itemRefs.current[i] = node;
              }}
              className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-[color,border-color,background-color,box-shadow] duration-500"
              style={{
                borderColor: lit ? "rgba(26, 92, 81, 0.45)" : "var(--line)",
                backgroundColor: lit
                  ? "rgba(126, 184, 164, 0.14)"
                  : "var(--surface)",
                color: lit ? "#1a5c51" : "var(--ink-soft)",
                boxShadow: lit ? "0 0 0 3px rgba(126, 184, 164, 0.12)" : "none",
              }}
            >
              {place}
            </li>
          );
        })}
        <span
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[#1a5c51] shadow-[0_0_0_4px_rgba(126,184,164,0.22)] transition-all duration-[1100ms] ease-in-out"
          style={{
            left: dot.x - 3,
            top: dot.y - 24,
            opacity: dot.x ? 1 : 0,
          }}
          aria-hidden
        />
      </ul>
    </div>
  );
}
