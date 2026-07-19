"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/developers/code-block";
import type { CodeToken } from "@/components/developers/highlight";
import { Button } from "@/components/ui/button";

export type EmbedVariantCard = {
  id: string;
  title: string;
  requirement: string;
  height: number;
  previewSrc: string;
  snippet: string;
  tokens: CodeToken[];
};

type Props = {
  variants: EmbedVariantCard[];
};

export function EmbedsSection({ variants }: Props) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-3">
      {variants.map((v, i) => (
        <EmbedCard key={v.id} variant={v} index={String(i + 1).padStart(2, "0")} />
      ))}
    </div>
  );
}

function EmbedCard({
  variant,
  index,
}: {
  variant: EmbedVariantCard;
  index: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(variant.snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] border border-line bg-surface">
      <div className="border-b border-line px-5 py-5">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[12px] text-muted">{index}</span>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-[#1f6b5c] uppercase">
            {variant.title}
          </p>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          {variant.requirement}
        </p>
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
          Live preview
        </p>
        <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-paper">
          <iframe
            src={variant.previewSrc}
            title={`${variant.title} embed preview`}
            width="100%"
            height={variant.height}
            className="block w-full border-0"
            loading="lazy"
          />
        </div>

        <p className="mt-4 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
          Snippet
        </p>
        <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1714]">
          <button
            type="button"
            onClick={copy}
            className="absolute top-2 right-2 z-10 rounded-lg border border-white/15 bg-[#0a1714]/90 px-2.5 py-1.5 text-[11px] font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <CodeBlock
            tokens={variant.tokens}
            className="overflow-x-auto px-3 py-3 pr-16 font-mono text-[11px] leading-relaxed"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="mt-3 h-10 w-full"
          onClick={copy}
        >
          {copied ? "Copied ✓" : "Copy snippet"}
        </Button>
      </div>
    </article>
  );
}
