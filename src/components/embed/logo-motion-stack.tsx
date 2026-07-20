import { EmbedBareLogo } from "@/components/embed/embed-bare-logo";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoSize } from "@/features/widgets/logo-motion";
import { LOGO_SIZE_PX } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  entries: LogoWallEntry[];
  siteUrl: string;
  theme: EmbedTheme;
  mono: boolean;
  size: LogoSize;
};

/** Vertical rise — logos enter from below (Viktor-style). */
export function LogoMotionStack({
  entries,
  siteUrl,
  theme,
  mono,
  size,
}: Props) {
  const slide = entries.length >= 2;
  const padded =
    slide && entries.length < 4
      ? [...entries, ...entries, ...entries]
      : entries;
  const track = slide ? [...padded, ...padded] : entries;
  const durationSec = Math.max(12, padded.length * 2.2);
  const rowH = LOGO_SIZE_PX[size] + 12;
  const viewH = rowH * 2;

  return (
    <div
      className={cn(
        "min-w-0 flex-1 overflow-hidden",
        "[mask-image:linear-gradient(180deg,transparent,black_14%,black_86%,transparent)]",
      )}
      style={{ height: viewH }}
    >
      <ul
        className={cn(
          "flex w-full flex-col items-center gap-3",
          slide && "linken-marquee-y",
        )}
        style={slide ? { animationDuration: `${durationSec}s` } : undefined}
      >
        {track.map((e, i) => (
          <li
            key={`${e.slug}-${i}`}
            className="flex shrink-0 items-center justify-center"
            style={{ height: rowH }}
          >
            <a
              href={`${siteUrl}/c/${e.slug}?src=embed`}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline opacity-85 transition-opacity hover:opacity-100"
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
