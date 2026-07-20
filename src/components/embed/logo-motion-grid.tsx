import { EmbedBareLogo } from "@/components/embed/embed-bare-logo";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoSize } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  entries: LogoWallEntry[];
  siteUrl: string;
  theme: EmbedTheme;
  mono: boolean;
  size: LogoSize;
};

/** Editorial grid — hairlines only, no card fills. */
export function LogoMotionGrid({
  entries,
  siteUrl,
  theme,
  mono,
  size,
}: Props) {
  const shown = entries.slice(0, 8);
  const line = theme === "dark" ? "border-white/12" : "border-[#e2e6e3]";

  return (
    <ul className="grid min-w-0 flex-1 grid-cols-4">
      {shown.map((e, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <li
            key={e.slug}
            className={cn(
              "flex items-center justify-center px-3 py-2.5",
              col < 3 && `border-r ${line}`,
              row === 0 && shown.length > 4 && `border-b ${line}`,
            )}
          >
            <a
              href={`${siteUrl}/c/${e.slug}?src=embed`}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline opacity-75 transition-opacity hover:opacity-100"
            >
              <EmbedBareLogo
                name={e.name}
                initials={e.initials}
                logoUrl={e.showLogo ? e.logoUrl : null}
                website={e.website}
                theme={theme}
                mono={mono}
                size={size}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
