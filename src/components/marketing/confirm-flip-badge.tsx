"use client";

import { useEffect, useState } from "react";

/** Inline status chip — Pending ↔ Confirmed. Product mechanic as motion. */
export function ConfirmFlipBadge() {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setConfirmed((v) => !v), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="relative mx-2.5 inline-grid h-[0.52em] w-[3.9em] min-h-9 min-w-[9.5rem] align-middle"
      style={{ perspective: "700px" }}
      aria-hidden
    >
      <span
        className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-md border border-line bg-paper text-[12px] font-semibold tracking-[0.12em] text-muted uppercase transition-[opacity,transform] duration-500"
        style={{
          opacity: confirmed ? 0 : 1,
          transform: confirmed ? "rotateX(90deg)" : "rotateX(0deg)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-plus" />
        Pending
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-md border border-[#1a5c51]/25 bg-[#1a5c51]/10 text-[12px] font-semibold tracking-[0.12em] text-[#1a5c51] uppercase transition-[opacity,transform] duration-500"
        style={{
          opacity: confirmed ? 1 : 0,
          transform: confirmed ? "rotateX(0deg)" : "rotateX(-90deg)",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
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
