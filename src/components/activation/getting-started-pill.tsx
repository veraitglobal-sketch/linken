"use client";

import { useEffect, useId, useRef, useState } from "react";
import { GettingStartedSteps } from "@/components/activation/getting-started-steps";
import type { ActivationChecklist } from "@/features/activation/checklist";
import { cn } from "@/lib/cn";

type Props = {
  checklist: ActivationChecklist;
};

export function GettingStartedPill({ checklist }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (checklist.complete) return null;

  const pct = Math.round((checklist.doneCount / checklist.total) * 100);
  const count = `${checklist.doneCount}/${checklist.total}`;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex h-8 max-w-full items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-2.5",
          "text-left transition-colors hover:border-[#d8dee8] hover:bg-[#f8fafc]",
          open && "border-[#d8dee8] bg-[#f8fafc]",
        )}
      >
        <span className="hidden text-[11px] font-semibold text-ink sm:inline">
          Getting started
        </span>
        <span
          className="hidden h-1 w-10 overflow-hidden rounded-full bg-[#f1f5f9] sm:block"
          aria-hidden
        >
          <span
            className="block h-full rounded-full bg-[#10231f]"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-[#64748b]">
          {count}
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Getting started"
          className="absolute top-[calc(100%+6px)] right-0 z-50 w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] sm:left-0 sm:right-auto"
        >
          <div className="px-4 pb-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
                Getting started
              </p>
              <p className="text-[12px] font-semibold tabular-nums text-[#64748b]">
                {count}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1f5f9]">
              <div
                className="h-full rounded-full bg-[#10231f] transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[#64748b]">
              Each step fills your network with confirmed evidence.
            </p>
          </div>
          <div className="px-2">
            <GettingStartedSteps
              steps={checklist.steps}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
