"use client";

import { EmbedLogoMotion } from "@/components/embed/embed-logo-motion";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import {
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  ownerProfileUrl: string;
  ownerCompanyId: string;
  viaHost?: string | null;
  entries: LogoWallEntry[];
  theme?: EmbedTheme;
  siteUrl: string;
  confirmedCount: number;
};

/**
 * Enterprise footer — one locked row: Verified · logos · count.
 * Fixed height so host footers never jump.
 */
export function EmbedFooterStrip({
  ownerProfileUrl,
  ownerCompanyId,
  viaHost,
  entries,
  theme = "light",
  siteUrl,
  confirmedCount,
}: Props) {
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        "box-border flex h-12 w-full min-w-0 items-center gap-3 overflow-hidden px-1",
        dark ? "text-white" : "text-[#0d1210]",
      )}
    >
      <a
        href={ownerProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Verified on Hansala"
        className="shrink-0 no-underline opacity-95 transition-opacity hover:opacity-100"
      >
        <EmbedVerifiedLockup theme={theme} size="sm" subtitle="Verified" />
      </a>

      <span
        className={cn(
          "hidden h-5 w-px shrink-0 sm:block",
          dark ? "bg-white/12" : "bg-[#0e1f1c]/12",
        )}
        aria-hidden
      />

      {entries.length > 0 ? (
        <div className="min-w-0 flex-1 opacity-[0.72] transition-opacity hover:opacity-100">
          <EmbedLogoMotion
            entries={entries}
            theme={theme}
            siteUrl={siteUrl}
            motion="row"
            size="sm"
            ownerCompanyId={ownerCompanyId}
            viaHost={viaHost}
          />
        </div>
      ) : (
        <p
          className={cn(
            "min-w-0 flex-1 truncate text-[11px] font-medium tracking-[-0.01em]",
            embedMutedClass(theme),
          )}
        >
          Mutually confirmed network
        </p>
      )}

      {confirmedCount > 0 ? (
        <p
          className={cn(
            "hidden shrink-0 tabular-nums sm:block",
            "text-[11px]",
            embedMutedClass(theme),
          )}
        >
          <span className={cn("font-display text-[13px] font-medium", embedInkClass(theme))}>
            {confirmedCount}
          </span>
          <span className="ml-1 tracking-[0.04em]">confirmed</span>
        </p>
      ) : null}
    </div>
  );
}
