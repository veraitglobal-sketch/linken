"use client";

import { useEffect, useRef, useState } from "react";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { useLogoWallActive } from "@/components/embed/use-logo-wall-active";
import { EmbedLogoCell } from "@/components/embed/embed-logo-cell";
import { EmbedLogoLockup } from "@/components/embed/embed-logo-lockup";
import type { LogoTone } from "@/features/widgets/logo-tile-url";
import type { LogoSize } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  ownerProfileUrl: string;
  ownerCompanyId: string;
  viaHost?: string | null;
  entries: LogoWallEntry[];
  theme: EmbedTheme;
  siteUrl: string;
  size: LogoSize;
  tone: LogoTone;
  /** Drift sideways instead of fitting what the width allows. */
  moving?: boolean;
};

/** Narrowest cell a logo gets before the static bar drops the rest. */
const CELL_MIN = 132;

/**
 * Trust bar — the verified mark and a count on the left, partner logos in one
 * line on the right, separated by hairlines.
 *
 * Logos are drawn as one-colour silhouettes that follow the background: ink on
 * a light page, white on a dark one, so a row of mixed brand colours sits in
 * the host's palette. The mark and its line are always rendered — there is no
 * setting that removes them.
 *
 * Every size decision reads the container, never the viewport: this runs in an
 * iframe or inside someone else's layout at a width we do not know.
 */
export function EmbedLogoBar({
  ownerProfileUrl,
  ownerCompanyId,
  viaHost,
  entries,
  theme,
  siteUrl,
  size,
  tone,
  moving = false,
}: Props) {
  const dark = theme === "dark";
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const active = useLogoWallActive(rootRef);
  const [fit, setFit] = useState(entries.length);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || moving || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 0;
      setFit(Math.max(1, Math.floor(w / CELL_MIN)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [moving]);

  const count = entries.length;
  const shown = moving ? entries : entries.slice(0, fit);
  const padded = moving && count > 0 && count < 6 ? [...entries, ...entries, ...entries] : entries;
  const track = moving ? [...padded, ...padded] : shown;
  const durationSec = Math.max(18, padded.length * 3.2);
  const line = dark ? "border-white/15" : "border-black/[0.09]";
  // Every logo gets the same box; the tile image inside is already optically sized.
  const cellWidth = { sm: 104, md: 128, lg: 152, xl: 176 }[size];

  return (
    <div
      ref={rootRef}
      data-logo-wall-paused={active ? "false" : "true"}
      className="@container box-border w-full bg-transparent px-2 py-3"
    >
      <div className="flex flex-col items-stretch gap-4 @[560px]:flex-row @[560px]:items-center @[560px]:gap-0">
        <EmbedLogoLockup count={count} href={ownerProfileUrl} theme={theme} className="@[560px]:pr-7" />

        <div
          ref={trackRef}
          className={cn(
            "min-w-0 flex-1 overflow-hidden",
            moving && "[mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]",
          )}
        >
          <ul
            className={cn("m-0 flex list-none items-center p-0", moving ? "w-max linken-marquee" : "w-full")}
            style={moving ? { animationDuration: `${durationSec}s` } : undefined}
          >
            {track.map((e, i) => (
              <li
                key={`${e.slug}-${i}`}
                className={cn(
                  "flex items-center justify-center border-l px-5",
                  line,
                  moving ? "shrink-0" : "min-w-0 flex-1",
                  !moving && i === 0 && "@max-[559px]:border-l-0 @max-[559px]:pl-0",
                )}
              >
                <span className="block" style={{ width: cellWidth }}>
                  <EmbedLogoCell
                    entry={e}
                    siteUrl={siteUrl}
                    ownerCompanyId={ownerCompanyId}
                    viaHost={viaHost}
                    theme={theme}
                    tone={tone}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

