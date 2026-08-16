"use client";

import { CopyChip } from "@/components/developers/copy-chip";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

export function DeveloperReferralLink({ url }: { url: string }) {
  return (
    <section>
      <header className="mb-3">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Referral link
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          First visit within 30 days is credited. Later referrers do not
          overwrite.
        </p>
      </header>
      <WorkspaceCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-line/70 bg-paper px-3.5 py-3 font-mono text-[12px] leading-snug text-ink">
            {url}
          </code>
          <CopyChip value={url} label="Copy link" className="sm:shrink-0" />
        </div>
      </WorkspaceCard>
    </section>
  );
}
