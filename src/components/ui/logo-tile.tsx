"use client";

import { useMemo, useState } from "react";
import { faviconFallbackUrls } from "@/features/logo/display-url";
import { cn } from "@/lib/cn";

export type LogoTileSize = "xs" | "sm" | "md";

type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  /** Favicon fallbacks when logo_url is missing/broken. */
  website?: string | null;
  /** Name beside the tile (`text-[12px]` truncate). */
  showName?: boolean;
  /** Grayscale + opacity on tile *content* only — not the frame. */
  mono?: boolean;
  /**
   * Frame contrast on dark embed shells. Tiles stay white (logos never inverted).
   */
  frameTone?: "light" | "dark";
  size?: LogoTileSize;
  className?: string;
  /** Soften tile when awaiting / unverified (configurator, map). */
  muted?: boolean;
};

const BOX: Record<LogoTileSize, string> = {
  xs: "h-6 w-6", // 24px — proof-row stack
  sm: "h-9 w-9", // 36px
  md: "h-11 w-11", // 44px
};

const PAD: Record<LogoTileSize, string> = {
  xs: "p-0.5",
  sm: "p-1",
  md: "p-1.5", // ~6px
};

const RADIUS: Record<LogoTileSize, string> = {
  xs: "rounded-lg",
  sm: "rounded-xl",
  md: "rounded-xl",
};

const INITIALS: Record<LogoTileSize, string> = {
  xs: "text-[8px]",
  sm: "text-[10px]",
  md: "text-[11px]",
};

/**
 * Uniform company logo pločica — favicon, wordmark, or initials.
 * Never render logos raw outside this tile.
 */
export function LogoTile({
  name,
  initials,
  logoUrl,
  website,
  showName = false,
  mono = false,
  frameTone = "light",
  size = "md",
  className,
  muted = false,
}: Props) {
  const candidates = useMemo(() => {
    const list: string[] = [];
    const primary = logoUrl?.trim();
    if (primary) list.push(primary);
    for (const url of faviconFallbackUrls(website)) {
      if (!list.includes(url)) list.push(url);
    }
    return list;
  }, [logoUrl, website]);

  const candidateKey = candidates.join("|");
  const [index, setIndex] = useState(0);
  const [trackedKey, setTrackedKey] = useState(candidateKey);

  if (trackedKey !== candidateKey) {
    setTrackedKey(candidateKey);
    setIndex(0);
  }

  const src = index < candidates.length ? candidates[index]! : null;
  const mark = (initials || "?").slice(0, 2).toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-2",
        muted && "opacity-60",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden bg-white",
          BOX[size],
          PAD[size],
          RADIUS[size],
          frameTone === "dark"
            ? "border border-black/15 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
            : "border border-line",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "flex h-full w-full items-center justify-center",
            mono && "opacity-70 grayscale",
          )}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              className="h-full w-full object-contain"
              onError={() => setIndex((i) => i + 1)}
            />
          ) : (
            <span
              className={cn(
                "font-semibold tracking-[0.06em] text-ink",
                INITIALS[size],
              )}
            >
              {mark}
            </span>
          )}
        </span>
      </span>
      {showName ? (
        <span className="min-w-0 truncate text-[12px] font-medium text-current">
          {name}
        </span>
      ) : null}
    </span>
  );
}
