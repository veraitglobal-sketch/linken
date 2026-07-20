"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function VerificationCopyBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-navy ring-1 ring-navy">
      <button
        type="button"
        onClick={copy}
        className={cn(
          "absolute top-2 right-2 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
          copied
            ? "bg-blue-soft/30 text-white"
            : "border border-white/15 text-white/70 hover:bg-white/10 hover:text-white",
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto px-3.5 py-3.5 pr-20 font-mono text-[11.5px] leading-relaxed text-white/88">
        {value}
      </pre>
    </div>
  );
}
