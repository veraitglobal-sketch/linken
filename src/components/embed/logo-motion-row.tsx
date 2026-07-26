import { LogoWallMarkLink } from "@/components/embed/logo-wall-mark-link";
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
  ownerCompanyId: string;
  viaHost?: string | null;
};

/** Horizontal drift — classic clean trust bar. */
export function LogoMotionRow({
  entries,
  siteUrl,
  theme,
  size,
  ownerCompanyId,
  viaHost,
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
