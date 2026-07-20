"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/developers/code-block";
import type { CodeTab } from "@/components/developers/code-types";
import { cn } from "@/lib/cn";

export type { CodeTab };

type Props = {
  tabs: CodeTab[];
  /** Optional label above the panel (e.g. Response). */
  caption?: string;
};

export function CodePanel({ tabs, caption }: Props) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  async function copy() {
    if (!current) return;
    await navigator.clipboard.writeText(current.source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (!current) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#081412] shadow-[0_18px_50px_rgba(10,20,18,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {caption ? (
            <span className="hidden shrink-0 text-[10px] font-semibold tracking-[0.12em] text-white/35 uppercase sm:inline">
              {caption}
            </span>
          ) : null}
          {tabs.length > 1 ? (
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/5 p-1 sm:max-w-[240px]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "h-8 rounded-lg text-[12px] font-semibold transition-colors",
                    active === tab.id
                      ? "bg-white text-[#0e1f1c]"
                      : "bg-transparent text-white/50 hover:text-white/80",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[12px] font-semibold text-white/70">
              {current.label}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/75 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <CodeBlock
        tokens={current.tokens}
        className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-[1.65]"
      />
    </div>
  );
}
