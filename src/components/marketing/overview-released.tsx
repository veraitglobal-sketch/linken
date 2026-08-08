"use client";

import { useEffect, useState } from "react";
import { EmbedProofRow } from "@/components/embed/embed-brand";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { OVERVIEW_PARTNERS } from "@/components/marketing/overview-partners";
import { cn } from "@/lib/cn";

/** Real embed components + operator data — never a fake logo wall. */
export function OverviewReleased({ on }: { on: boolean }) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out",
        on ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
      )}
    >
      <div className="overflow-hidden rounded-xl bg-navy px-3.5 py-3">
        <code className="block truncate font-mono text-[10.5px] leading-5 text-white/75">
          <span className="text-blue-soft">&lt;iframe</span> src=
          &quot;hansala.com/embed/verait&quot;&gt;
        </code>
        <code className="block truncate font-mono text-[10.5px] leading-5 text-white/45">
          <span className="text-blue-soft">GET</span>{" "}
          /api/v1/companies/verait/partners
        </code>
      </div>

      <div className="my-2.5 flex justify-center" aria-hidden>
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
          <path
            d="M7 1v17m0 0 5-5m-5 5-5-5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink/25"
          />
        </svg>
      </div>

      {zoomed ? (
        <button
          type="button"
          aria-label="Close enlarged widget"
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-40 cursor-zoom-out bg-navy/45 backdrop-blur-[2px]"
        />
      ) : null}

      <div
        className={cn(
          zoomed
            ? "fixed top-1/2 left-1/2 z-50 w-[min(760px,92vw)] -translate-x-1/2 -translate-y-1/2"
            : "relative",
        )}
      >
        <button
          type="button"
          aria-expanded={zoomed}
          aria-label={zoomed ? "Close enlarged widget" : "Enlarge the widget"}
          onClick={() => setZoomed((v) => !v)}
          className={cn(
            "block w-full overflow-hidden rounded-xl border border-ink/[0.08] bg-white text-left",
            zoomed
              ? "cursor-zoom-out shadow-[0_40px_90px_-20px_rgba(8,20,18,0.45)]"
              : "cursor-zoom-in shadow-[0_10px_28px_rgba(8,20,18,0.08)]",
          )}
        >
          <span className="flex items-center gap-2 border-b border-ink/[0.06] px-3.5 py-2">
            <span className="size-[6px] rounded-full bg-ink/10" />
            <span className="size-[6px] rounded-full bg-ink/10" />
            <span className="ml-1.5 text-[10px] text-muted">verait.de</span>
            <span className="ml-auto text-[9.5px] font-semibold tracking-[0.14em] text-plus uppercase">
              {zoomed ? "Close" : "Enlarge"}
            </span>
          </span>
          <span className="block px-4 pt-3.5 pb-4">
            <span className="block text-[9px] font-semibold tracking-[0.18em] text-plus uppercase">
              Partners
            </span>
            <span className="mt-2.5 block">
              <EmbedProofRow
                companies={OVERVIEW_PARTNERS}
                total={OVERVIEW_PARTNERS.length}
                theme="light"
              />
            </span>
            <span className="mt-3.5 block border-t border-ink/[0.07] pt-3">
              <EmbedVerifiedLockup size="sm" />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
