"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  siteUrl: string;
};

export function EmbedSnippetButton({ companySlug, siteUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedUrl = `${siteUrl}/embed/${companySlug}`;
  const snippet = `<iframe src="${embedUrl}" width="320" height="72" style="border:0" title="Verified on Linken" loading="lazy"></iframe>`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
        Embed
      </Button>
      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-80 border border-line bg-white p-4 shadow-lg">
          <p className="text-[13px] font-medium text-ink">
            Add your verified badge to your website
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Paste this snippet on your site. It links back to your public
            Linken profile.
          </p>
          <textarea
            readOnly
            value={snippet}
            className="mt-3 h-20 w-full resize-none border border-line bg-paper px-2 py-1.5 text-[11px] text-ink-soft"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button variant="secondary" className="mt-2 w-full" onClick={copy}>
            {copied ? "Copied" : "Copy snippet"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
