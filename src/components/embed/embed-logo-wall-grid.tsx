"use client";

import { EmbedLogoBar } from "@/components/embed/embed-logo-bar";
import { resolveTone } from "@/components/embed/embed-logo-cell";
import { EmbedLogoMotion } from "@/components/embed/embed-logo-motion";
import { EmbedLogoTiles } from "@/components/embed/embed-logo-tiles";
import type { LogoWallTone } from "@/features/widgets/settings";
import { EmbedVerified } from "@/components/embed/embed-verified";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoMotion, LogoSize } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";

type Props = {
  ownerProfileUrl: string;
  ownerCompanyId: string;
  viaHost?: string | null;
  entries: LogoWallEntry[];
  theme?: EmbedTheme;
  siteUrl: string;
  motion?: LogoMotion;
  size?: LogoSize;
  tone?: LogoWallTone;
};

/** Catalog Logo wall — Hansala Verified on top; motion from settings. */
export function EmbedLogoWallGrid({
  ownerProfileUrl,
  ownerCompanyId,
  viaHost,
  entries,
  theme = "light",
  siteUrl,
  motion = "grid",
  size = "md",
  tone = "auto",
}: Props) {
  const logoTone = resolveTone(tone, theme);
  if (motion === "tiles") {
    return (
      <EmbedLogoTiles
        ownerProfileUrl={ownerProfileUrl}
        ownerCompanyId={ownerCompanyId}
        viaHost={viaHost}
        entries={entries}
        theme={theme}
        tone={logoTone}
        siteUrl={siteUrl}
      />
    );
  }
  if (motion === "bar" || motion === "bar-slide") {
    return (
      <EmbedLogoBar
        ownerProfileUrl={ownerProfileUrl}
        ownerCompanyId={ownerCompanyId}
        viaHost={viaHost}
        entries={entries}
        theme={theme}
        siteUrl={siteUrl}
        size={size}
        tone={logoTone}
        moving={motion === "bar-slide"}
      />
    );
  }
  return (
    <div className="box-border flex w-full flex-col gap-5 bg-transparent px-1 py-2">
      <div className="flex justify-center">
        <EmbedVerified profileUrl={ownerProfileUrl} theme={theme} />
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
