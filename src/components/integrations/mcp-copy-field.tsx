"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function McpCopyField({
  value,
  label,
  mono = true,
}: {
  value: string;
  label: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch gap-2">
      <code
        className={cn(
          "min-w-0 flex-1 overflow-x-auto rounded-xl bg-[#fafbf9] px-3.5 py-2.5 text-[13px] whitespace-pre text-ink ring-1 ring-line",
          !mono && "font-sans",
        )}
      >
        {value}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          } catch {
            /* clipboard blocked — the text is selectable */
          }
        }}
        aria-label={`Copy ${label}`}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors",
          copied ? "bg-lime text-navy" : "bg-navy text-on-navy hover:bg-navy-deep",
        )}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
