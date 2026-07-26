"use client";

import { EmbedLogoMotion } from "@/components/embed/embed-logo-motion";
import { EmbedPlacementRail } from "@/components/embed/embed-placement-rail";
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

/** Editorial partner field — logos only, no SaaS chrome. */
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
    <div className="box-border w-full px-0.5 py-1">
      <EmbedPlacementRail
        label="Mutually confirmed"
        href={profileUrl}
        linkLabel="Verify on Hansala"
        theme={theme}
      />
      <div
        className={cn(
          "mt-4 opacity-[0.78] transition-opacity duration-200 hover:opacity-100",
          dark && "[&_img]:brightness-110",
        )}
      >
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
    </div>
  );
}
