"use client";

import { useState } from "react";
import { CopyChip } from "@/components/developers/copy-chip";
import { EmbedPartnerCard } from "@/components/embed/embed-partner-card";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { buildPartnerEmbedSnippet } from "@/features/commissions/partner-embed-snippet";
import { cn } from "@/lib/cn";

type Props = {
  companyName: string;
  companySlug: string;
  siteUrl: string;
  profileUrl: string;
  verified: boolean;
  referredCount: number;
};

export function DeveloperPartnerWidget({
  companyName,
  companySlug,
  siteUrl,
  profileUrl,
  verified,
  referredCount,
}: Props) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const snippet = buildPartnerEmbedSnippet({
    siteUrl,
    slug: companySlug,
    theme,
  });

  return (
    <section>
      <header className="mb-3">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Partner badge
        </h2>
        <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted">
          Put your firm name on your site as a Hansala developer partner. Paste
          once — visitors can verify you on Hansala.
        </p>
      </header>

      <WorkspaceCard>
        <div className="flex flex-wrap gap-2">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={cn(
                "h-8 rounded-full px-3.5 text-[11px] font-semibold capitalize transition-colors",
                theme === t
                  ? "bg-navy text-white"
                  : "border border-line bg-paper text-muted hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "mt-4 flex justify-center rounded-hero px-6 py-12 sm:px-10 sm:py-14",
            theme === "dark"
              ? "bg-[#081412] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              : "bg-[#e4e8e5] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
          )}
        >
          <EmbedPartnerCard
            name={companyName}
            profileUrl={profileUrl}
            verified={verified}
            referredCount={referredCount}
            theme={theme}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-line/70 bg-paper px-3.5 py-3 font-mono text-[11px] leading-snug text-ink">
            {snippet}
          </code>
          <CopyChip value={snippet} label="Copy embed" className="sm:shrink-0" />
        </div>
      </WorkspaceCard>
    </section>
  );
}
