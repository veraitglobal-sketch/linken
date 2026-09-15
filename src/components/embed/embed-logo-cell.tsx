import type { EmbedTheme } from "@/components/embed/embed-theme";
import { embedPartnerHref } from "@/features/widgets/embed-href";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { isAllowedLogoSourceUrl, logoTileUrl, type LogoTone } from "@/features/widgets/logo-tile-url";
import type { LogoWallTone } from "@/features/widgets/settings";
import { cn } from "@/lib/cn";

export function resolveTone(tone: LogoWallTone, theme: EmbedTheme): LogoTone {
  if (tone === "auto") return theme === "dark" ? "white" : "ink";
  return tone;
}

/**
 * One partner logo, normalised on the server (background cut out, trimmed,
 * same optical size, chosen tone). Without a stored logo it falls back to the
 * company's name, set in type — never a favicon, never a grey box.
 */
export function EmbedLogoCell({
  entry: e,
  siteUrl,
  ownerCompanyId,
  viaHost,
  theme,
  tone,
  className,
}: {
  entry: LogoWallEntry;
  siteUrl: string;
  ownerCompanyId: string;
  viaHost?: string | null;
  theme: EmbedTheme;
  tone: LogoTone;
  className?: string;
}) {
  const dark = theme === "dark";
  const src = e.showLogo && e.logoUrl && isAllowedLogoSourceUrl(e.logoUrl) ? logoTileUrl(e.logoUrl, tone) : null;
  return (
    <a
      href={embedPartnerHref({ siteUrl, partnerSlug: e.slug, ownerCompanyId, viaHost })}
      target="_blank"
      rel="noopener noreferrer"
      title={e.name}
      className={cn(
        "flex h-full w-full items-center justify-center no-underline transition-opacity duration-200 hover:opacity-100",
        tone === "original" ? "opacity-90" : dark ? "opacity-90" : "opacity-80",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={e.name} loading="lazy" className="block h-auto w-full max-w-[220px]" width={480} height={200} />
      ) : (
        <span
          className={cn(
            "px-2 text-center text-[15px] leading-tight font-semibold tracking-[-0.02em]",
            dark ? "text-white" : "text-[#0d1210]",
          )}
        >
          {e.name}
        </span>
      )}
    </a>
  );
}
