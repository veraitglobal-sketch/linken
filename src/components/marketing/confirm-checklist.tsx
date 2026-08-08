"use client";

import { useEffect, useRef, useState } from "react";

/** Reveals children one by one, staggered, the first time it scrolls into view. */
export function ConfirmChecklist({ items }: { items: string[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ul ref={ref} className="relative mt-auto space-y-3.5 pt-10 text-sm text-white/88">
      {items.map((item, i) => (
        <li
          key={item}
          className="flex items-center gap-2.5 transition-[opacity,transform] duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-8px)",
            transitionDelay: `${i * 180}ms`,
          }}
        >
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signal/15">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              style={{
                strokeDasharray: 24,
                strokeDashoffset: visible ? 0 : 24,
                transition: `stroke-dashoffset 380ms ease-out ${i * 180 + 120}ms`,
              }}
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="#7eb8a4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
