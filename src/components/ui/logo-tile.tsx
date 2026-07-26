"use client";

import { useMemo, useState } from "react";
import {
  faviconFallbackUrls,
  isFaviconLogoUrl,
} from "@/features/logo/display-url";
import { cn } from "@/lib/cn";

export type LogoTileSize = "xs" | "sm" | "md";

type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  /** Used only when allowFavicon — workspace switcher / structure. */
  website?: string | null;
  /**
   * Favicons in round partner marks look bad. Default false.
   * Workspace switcher uses LogoMark (favicons ok). Pass true only when needed.
   */
  allowFavicon?: boolean;
  showName?: boolean;
  mono?: boolean;
  frameTone?: "light" | "dark";
  size?: LogoTileSize;
  shape?: "tile" | "circle";
  className?: string;
  muted?: boolean;
};

const BOX: Record<LogoTileSize, string> = {
  xs: "h-6 w-6",
  sm: "h-9 w-9",
  md: "h-11 w-11",
};

const PAD: Record<LogoTileSize, string> = {
  xs: "p-0.5",
  sm: "p-1",
  md: "p-1.5",
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

/** Real logo or initials. Favicons only when allowFavicon is true. */
export function LogoTile({
  name,
  initials,
  logoUrl,
  website,
  allowFavicon = false,
  showName = false,
  mono = false,
  frameTone = "light",
  size = "md",
  shape = "tile",
  className,
  muted = false,
}: Props) {
  const candidates = useMemo(() => {
    const list: string[] = [];
    const primary = logoUrl?.trim();
    if (primary && (allowFavicon || !isFaviconLogoUrl(primary))) {
      list.push(primary);
    }
    if (allowFavicon) {
      for (const url of faviconFallbackUrls(website)) {
        if (!list.includes(url)) list.push(url);
      }
    }
    return list;
  }, [logoUrl, website, allowFavicon]);

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
          shape === "circle" ? "rounded-full" : RADIUS[size],
          shape === "circle"
            ? "border-0"
            : frameTone === "dark"
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
              loading="lazy"
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
