import { EmbedVerified } from "@/components/embed/embed-verified";
import { EmbedBareLogo } from "@/components/embed/embed-bare-logo";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  ownerProfileUrl: string;
  entries: LogoWallEntry[];
  theme?: EmbedTheme;
  siteUrl: string;
};

/**
 * Catalog Logo wall — Hansala Verified on top, partner marks in a calm grid.
 * Transparent background, monochrome treatment, responsive 2–3 rows.
 */
export function EmbedLogoWallGrid({
  ownerProfileUrl,
  entries,
  theme = "light",
  siteUrl,
}: Props) {
  const dark = theme === "dark";
  const shown = entries.slice(0, 30);

  return (
    <div className="box-border flex w-full flex-col gap-5 bg-transparent px-1 py-2">
      <div className="flex justify-center">
        <EmbedVerified profileUrl={ownerProfileUrl} theme={theme} />
      </div>
      {shown.length === 0 ? (
        <p
          className={cn(
            "text-center text-[11px]",
            dark ? "text-white/45" : "text-[#66706b]",
          )}
        >
          No partners on this wall yet
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 md:grid-cols-4">
          {shown.map((e) => (
            <li key={e.id} className="flex items-center justify-center">
              <a
                href={`${siteUrl}/c/${e.slug}?src=embed`}
                target="_blank"
                rel="noopener noreferrer"
                title={e.name}
                className="block no-underline opacity-75 transition-opacity hover:opacity-100"
              >
                {e.showLogo ? (
                  <EmbedBareLogo
                    name={e.name}
                    initials={e.initials}
                    logoUrl={e.logoUrl}
                    website={e.website}
                    theme={theme}
                    mono
                    size="md"
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
