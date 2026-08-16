"use client";

import { useState } from "react";
import { buildEmbedSnippet } from "@/features/widgets/embed-snippet";
import { cn } from "@/lib/cn";

type Props = {
  slug: string;
  siteUrl: string;
  className?: string;
};

/** Same snippet builder as the widget studio — Micro, light, full width. */
export function DeveloperInstallSnippet({ slug, siteUrl, className }: Props) {
  const [copied, setCopied] = useState(false);
  const snippet = buildEmbedSnippet({
    siteUrl,
    slug,
    variant: "micro",
    theme: "light",
    width: "100%",
  });

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border border-line/80 bg-paper px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-surface",
        className,
      )}
    >
      {copied ? "Copied ✓" : "Copy snippet"}
    </button>
  );
}
