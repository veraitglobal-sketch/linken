"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  buildEmbedSnippet,
  buildEmbedSrc,
} from "@/features/widgets/catalog";

type Props = {
  companySlug: string;
  siteUrl: string;
};

/** Quick compact copy + link into Widget studio (full configurator). */
export function EmbedSnippetButton({ companySlug, siteUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = buildEmbedSnippet({
    siteUrl,
    slug: companySlug,
    variant: "micro",
    theme: "light",
    width: "100%",
  });
  const previewSrc = buildEmbedSrc({
    siteUrl,
    slug: companySlug,
    variant: "micro",
    theme: "light",
    preview: true,
  });

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="onDark"
        className="h-10 px-4"
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
            Quick copy for the Micro widget — or open the studio
            for themes, sizes, and every variant.
          </p>

          <div className="mt-3 overflow-hidden rounded-xl border border-line bg-[#f7f8fa]">
            <iframe
              src={previewSrc}
              title="Micro embed preview"
              width="100%"
              height={52}
              className="block w-full border-0"
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            className="mt-3 h-10 w-full"
            onClick={copy}
          >
            {copied ? "Copied ✓" : "Copy Micro snippet"}
          </Button>

          <Link
            href="/dashboard/widgets"
            className="mt-3 flex h-10 items-center justify-center rounded-xl bg-[#0e1f1c] text-[13px] font-semibold text-white transition-colors hover:bg-[#081412]"
            onClick={() => setOpen(false)}
          >
            Open Widget studio →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
