"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  value: string;
  label?: string;
  className?: string;
  /** Dark hero / code surfaces */
  onDark?: boolean;
};

export function CopyChip({
  value,
  label = "Copy",
  className,
  onDark = false,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "shrink-0 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors",
        onDark
          ? "border border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/15"
          : "border border-line bg-white text-ink hover:border-ink/25",
        className,
      )}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
