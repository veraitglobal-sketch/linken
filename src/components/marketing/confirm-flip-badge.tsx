"use client";

import { useEffect, useState } from "react";

/** Inline animated pill — flips Pending → Confirmed on a loop. The one visual
 * "trick" per section, tied directly to the product's actual mechanic. */
export function ConfirmFlipBadge() {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setConfirmed((v) => !v), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="relative mx-2 inline-grid h-[0.56em] w-[3.6em] min-h-9 min-w-36 align-middle"
      style={{ perspective: "600px" }}
      aria-hidden
    >
      <span
        className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-full border border-line bg-paper text-[13px] font-semibold tracking-[0.08em] text-muted uppercase transition-[opacity,transform] duration-500"
        style={{
          opacity: confirmed ? 0 : 1,
          transform: confirmed ? "rotateX(90deg)" : "rotateX(0deg)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-plus" />
        Pending
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-full border border-[#7eb8a4]/45 bg-[#7eb8a4]/15 text-[13px] font-semibold tracking-[0.08em] text-[#1a5c51] uppercase transition-[opacity,transform] duration-500"
        style={{
          opacity: confirmed ? 1 : 0,
          transform: confirmed ? "rotateX(0deg)" : "rotateX(-90deg)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Confirmed
      </span>
    </span>
  );
}
