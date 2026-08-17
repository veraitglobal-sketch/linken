"use client";

import { useEffect, useState } from "react";
import {
  FLOW_DOMAIN,
  FLOW_HUB,
  FLOW_TARGET,
} from "@/components/marketing/product-flow-data";
import {
  FlowGlyph,
  FlowMark,
  FlowRequestPill,
} from "@/components/marketing/product-flow-parts";
import { cn } from "@/lib/cn";

function SearchField({ typing }: { typing: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!typing) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= FLOW_DOMAIN.length) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
  }, [typing]);

  return (
    <span className="text-[14px] text-ink">
      {FLOW_DOMAIN.slice(0, typing ? n : FLOW_DOMAIN.length)}
    </span>
  );
}

export function FlowInspector({
  selected,
  adding,
  found,
  requested,
  confirmed,
  step,
}: {
  selected: boolean;
  adding: boolean;
  found: boolean;
  requested: boolean;
  confirmed: boolean;
  step: number;
}) {
  return (
    <aside
      className={cn(
        "w-[300px] shrink-0 border-l border-line/70 bg-surface transition-[opacity,transform] duration-500 ease-out",
        selected ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
      )}
    >
      <div className="flex items-center gap-2 border-b border-line/70 px-4 py-3.5">
        <span className="text-[14px] font-semibold tracking-[-0.02em] text-ink">
          {FLOW_HUB.name}
        </span>
        <span className="ml-auto rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-blue">
          Company
        </span>
      </div>
      <div className="border-b border-line/70 px-4 py-4">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
          Company
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <FlowMark
            name={FLOW_HUB.name}
            initials={FLOW_HUB.initials}
            logo={FLOW_HUB.logo}
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">
              {FLOW_HUB.name}
            </p>
            <p className="truncate text-[11.5px] text-muted">
              {FLOW_HUB.domain}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-muted">
          {confirmed ? "1 partner" : "0 partners"} · Domain verified
        </p>
      </div>
      <div className="px-4 py-3.5">
        <span
          className={cn(
            "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-300",
            adding ? "bg-accent-soft" : "bg-transparent",
          )}
        >
          <span className={adding ? "text-blue" : "text-muted"}>
            <FlowGlyph d="M12 5v14M5 12h14" />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block text-[13px] font-semibold",
                adding ? "text-blue" : "text-ink",
              )}
            >
              Add partners on Company
            </span>
            <span className="block text-[11px] leading-snug text-muted">
              Confirmed partners appear on the map automatically
            </span>
          </span>
        </span>
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
            adding ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-2 flex h-10 items-center rounded-xl border border-line bg-paper px-3">
              {step >= 3 && step < 6 ? (
                <SearchField typing={step === 3} />
              ) : (
                <span className="text-[13px] text-muted">
                  Search registered companies
                </span>
              )}
              <span
                className={cn(
                  "ml-px h-[16px] w-px bg-ink transition-opacity",
                  step === 3 ? "animate-pulse opacity-100" : "opacity-0",
                )}
              />
            </div>
            <div
              className={cn(
                "mt-2 transition-[opacity,transform] duration-500 ease-out",
                found
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1.5 opacity-0",
              )}
            >
              <div className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-surface px-3 py-2.5">
                <FlowMark
                  name={FLOW_TARGET.name}
                  initials={FLOW_TARGET.initials}
                  logo={FLOW_TARGET.logo}
                  small
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-ink">
                    {FLOW_TARGET.name}
                  </p>
                  <p className="truncate text-[10.5px] text-muted">
                    {FLOW_TARGET.domain} ·{" "}
                    <span className="font-semibold text-success">Verified</span>
                  </p>
                </div>
                <FlowRequestPill
                  state={
                    confirmed ? "official" : requested ? "pending" : "idle"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
