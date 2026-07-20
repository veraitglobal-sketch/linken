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

/** Horizontal drift — classic clean trust bar. */
export function LogoMotionRow({
  entries,
  siteUrl,
  theme,
  mono,
  size,
}: Props) {
  const slide = entries.length >= 2;
  const padded =
    slide && entries.length < 5
      ? [...entries, ...entries, ...entries]
      : entries;
  const track = slide ? [...padded, ...padded] : entries;
  const durationSec = Math.max(14, padded.length * 2.6);

  return (
    <div
      className={cn(
        "min-w-0 flex-1 overflow-hidden",
        "[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
      )}
    >
      <ul
        className={cn(
          "flex w-max items-center gap-8 py-1",
          slide && "linken-marquee",
        )}
        style={slide ? { animationDuration: `${durationSec}s` } : undefined}
      >
        {track.map((e, i) => (
          <li key={`${e.slug}-${i}`} className="shrink-0">
            <a
              href={`${siteUrl}/c/${e.slug}?src=embed`}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline opacity-80 transition-opacity hover:opacity-100"
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
        ))}
      </ul>
    </div>
  );
}
