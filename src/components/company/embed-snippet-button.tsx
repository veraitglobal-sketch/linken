"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Variant = "badge" | "assessment" | "references";

type Props = {
  companySlug: string;
  siteUrl: string;
};

const VARIANTS: { id: Variant; label: string; height: number; hint: string }[] =
  [
    {
      id: "badge",
      label: "Badge",
      height: 72,
      hint: "Compact verified badge — default for existing embeds.",
    },
    {
      id: "assessment",
      label: "Assessment",
      height: 120,
      hint: "Would-work-again + top strengths (needs ≥3 client answers).",
    },
    {
      id: "references",
      label: "References",
      height: 160,
      hint: "Up to 5 confirmed client references.",
    },
  ];

function snippetFor(
  siteUrl: string,
  slug: string,
  variant: Variant,
  height: number,
) {
  const src =
    variant === "badge"
      ? `${siteUrl}/embed/${slug}`
      : `${siteUrl}/embed/${slug}?variant=${variant}`;
  return `<iframe src="${src}" width="320" height="${height}" style="border:0" title="Verified on Linken" loading="lazy"></iframe>`;
}

export function EmbedSnippetButton({ companySlug, siteUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<Variant>("badge");
  const [copied, setCopied] = useState(false);

  const meta = VARIANTS.find((v) => v.id === variant)!;
  const snippet = snippetFor(siteUrl, companySlug, variant, meta.height);
  const previewSrc =
    variant === "badge"
      ? `${siteUrl}/embed/${companySlug}`
      : `${siteUrl}/embed/${companySlug}?variant=${variant}`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="secondary"
        className="h-11 min-w-[150px] px-5"
        onClick={() => setOpen((v) => !v)}
      >
        Embed
      </Button>
      {open ? (
        <div className="absolute left-0 z-20 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-line bg-white p-4 shadow-[0_18px_50px_rgba(10,20,18,0.12)] sm:left-auto sm:right-0">
          <p className="text-[13px] font-medium text-ink">
            Embed on your website
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Confirmed evidence only. Links back with{" "}
            <code className="text-[11px]">?src=embed</code>.
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.06em] uppercase transition-colors",
                  variant === v.id
                    ? "border-[#1f6b5c] bg-[#1f6b5c]/10 text-[#1f6b5c]"
                    : "border-line bg-white text-ink-soft hover:border-ink/25",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-ink-soft">{meta.hint}</p>

          <div className="mt-3 overflow-hidden rounded-xl border border-line bg-[#f7f8fa]">
            <iframe
              src={previewSrc}
              title="Embed preview"
              width="100%"
              height={meta.height}
              className="block w-full border-0"
            />
          </div>

          <textarea
            readOnly
            value={snippet}
            className="mt-3 h-20 w-full resize-none rounded-xl border border-line bg-paper px-2.5 py-2 text-[11px] text-ink-soft"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button
            type="button"
            variant="secondary"
            className="mt-2 h-10 w-full"
            onClick={copy}
          >
            {copied ? "Copied" : "Copy snippet"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
