import { LogoWallMarkLink } from "@/components/embed/logo-wall-mark-link";
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
  ownerCompanyId: string;
  viaHost?: string | null;
};

/** Vertical rise — logos enter from below (Viktor-style). */
export function LogoMotionStack({
  entries,
  siteUrl,
  theme,
  size,
  ownerCompanyId,
  viaHost,
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
            <LogoWallMarkLink
              entry={e}
              siteUrl={siteUrl}
              theme={theme}
              size={size}
              ownerCompanyId={ownerCompanyId}
              viaHost={viaHost}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
