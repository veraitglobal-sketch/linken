"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { faviconFallbackUrls } from "@/features/logo/display-url";
import type { LogoSize } from "@/features/widgets/logo-motion";
import { LOGO_SIZE_PX } from "@/features/widgets/logo-motion";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  website?: string | null;
  theme?: EmbedTheme;
  /** Monochrome mark — premium default for logo walls. */
  mono?: boolean;
  size?: LogoSize;
  className?: string;
};

/**
 * Clean logo mark — no tile, no border, no fill.
 * Viktor / editorial style: just the mark on the page background.
 */
export function EmbedBareLogo({
  name,
  initials,
  logoUrl,
  website,
  theme = "light",
  mono = true,
  size = "md",
  className,
}: Props) {
  const px = LOGO_SIZE_PX[size];
  const candidates = useMemo(() => {
    const list: string[] = [];
    const primary = logoUrl?.trim();
    if (primary) list.push(primary);
    for (const url of faviconFallbackUrls(website)) {
      if (!list.includes(url)) list.push(url);
    }
    return list;
  }, [logoUrl, website]);

  const key = candidates.join("|");
  const [index, setIndex] = useState(0);
  const [tracked, setTracked] = useState(key);
  if (tracked !== key) {
    setTracked(key);
    setIndex(0);
  }

  const src = index < candidates.length ? candidates[index]! : null;
  const mark = (initials || "?").slice(0, 2).toUpperCase();

  // A cached/instant 404 can fail before React attaches the onError
  // listener during hydration — catch that missed error after mount.
  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setIndex((i) => i + 1);
    }
  }, [src]);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        className,
      )}
      style={{ height: px, maxWidth: px * 3.2 }}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={name}
          loading="lazy"
          className={cn(
            "h-full w-auto max-w-full object-contain",
            mono && theme === "dark" && "brightness-0 invert",
            mono && theme === "light" && "brightness-0",
          )}
          onError={() => setIndex((i) => i + 1)}
        />
      ) : (
        <span
          className={cn(
            "text-[11px] font-semibold tracking-[0.08em]",
            mono
              ? theme === "dark"
                ? "text-white"
                : "text-[#0d1210]"
              : "text-ink",
          )}
        >
          {mark}
        </span>
      )}
    </span>
  );
}
