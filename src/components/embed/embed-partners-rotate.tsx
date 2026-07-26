"use client";

import { EmbedLogoMotion } from "@/components/embed/embed-logo-motion";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoMotion, LogoSize } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  ownerCompanyId: string;
  viaHost?: string | null;
  entries: LogoWallEntry[];
  theme?: EmbedTheme;
  siteUrl: string;
  motion?: LogoMotion;
  size?: LogoSize;
  profileUrl: string;
};

/** Partners-only rotate — no Verified chrome; logos cycle on the host site. */
export function EmbedPartnersRotate({
  ownerCompanyId,
  viaHost,
  entries,
  theme = "light",
  siteUrl,
  motion = "swap-random",
  size = "md",
  profileUrl,
}: Props) {
  const dark = theme === "dark";

  return (
    <div className="box-border flex w-full flex-col gap-3 px-1 py-2">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <p
          className={cn(
            "text-[11px] font-semibold tracking-[0.08em] uppercase",
            dark ? "text-white/45" : "text-[#66706b]",
          )}
        >
          Confirmed partners
        </p>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-[11px] font-semibold no-underline",
            dark ? "text-[#7eb8a4]" : "text-[#1a5c51]",
          )}
        >
          Hansala →
        </a>
      </div>
      <EmbedLogoMotion
        entries={entries}
        theme={theme}
        siteUrl={siteUrl}
        motion={motion}
        size={size}
        ownerCompanyId={ownerCompanyId}
        viaHost={viaHost}
      />
    </div>
  );
}
