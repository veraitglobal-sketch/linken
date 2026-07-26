"use client";

import { EmbedLogoMotion } from "@/components/embed/embed-logo-motion";
import { EmbedVerified } from "@/components/embed/embed-verified";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoSize } from "@/features/widgets/logo-motion";
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

/** Slim footer strip — Verified + drifting partner logos. */
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
  const size: LogoSize = "sm";

  return (
    <div
      className={cn(
        "box-border flex w-full flex-wrap items-center gap-4 px-2 py-1.5",
        "sm:flex-nowrap",
      )}
    >
      <div className="shrink-0">
        <EmbedVerified profileUrl={ownerProfileUrl} theme={theme} />
      </div>
      {entries.length > 0 ? (
        <>
          <span
            className={cn(
              "hidden h-4 w-px shrink-0 sm:block",
              dark ? "bg-white/15" : "bg-[#0e1f1c]/12",
            )}
            aria-hidden
          />
          <EmbedLogoMotion
            entries={entries}
            theme={theme}
            siteUrl={siteUrl}
            motion="row"
            size={size}
            ownerCompanyId={ownerCompanyId}
            viaHost={viaHost}
          />
        </>
      ) : (
        <p
          className={cn(
            "text-[11px] font-medium",
            dark ? "text-white/50" : "text-[#66706b]",
          )}
        >
          {confirmedCount > 0
            ? `${confirmedCount} confirmed on Hansala`
            : "Verified on Hansala"}
        </p>
      )}
    </div>
  );
}
