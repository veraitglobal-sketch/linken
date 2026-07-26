"use client";

import { EmbedBareLogo } from "@/components/embed/embed-bare-logo";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { embedPartnerHref } from "@/features/widgets/embed-href";
import type { LogoSize } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

export function LogoWallMarkLink({
  entry: e,
  siteUrl,
  theme,
  size,
  ownerCompanyId,
  viaHost,
}: {
  entry: LogoWallEntry;
  siteUrl: string;
  theme: EmbedTheme;
  size: LogoSize;
  ownerCompanyId: string;
  viaHost?: string | null;
}) {
  const dark = theme === "dark";
  const href = embedPartnerHref({
    siteUrl,
    partnerSlug: e.slug,
    ownerCompanyId,
    viaHost,
  });
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={e.name}
      className="block no-underline opacity-[0.62] transition-opacity duration-200 hover:opacity-100"
    >
      {e.showLogo ? (
        <EmbedBareLogo
          name={e.name}
          initials={e.initials}
          logoUrl={e.logoUrl}
          website={e.website}
          theme={theme}
          mono
          size={size}
          scale={e.scale}
          padding={e.padding}
          grayscale={e.grayscale}
          invertOnDark={e.invertOnDark}
        />
      ) : (
        <span
          className={cn(
            "text-[12px] font-semibold tracking-[0.06em]",
            dark ? "text-white/80" : "text-[#0d1210]",
          )}
        >
          {e.name}
        </span>
      )}
    </a>
  );
}
