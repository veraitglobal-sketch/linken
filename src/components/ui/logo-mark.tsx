"use client";

import { useEffect, useMemo, useState } from "react";
import { faviconFallbackUrls } from "@/features/logo/display-url";
import { cn } from "@/lib/cn";

type Props = {
  initials: string;
  logoUrl?: string | null;
  /** When logo_url is missing/broken, try favicons from this website. */
  website?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-9 w-9 text-[10px]",
  md: "h-11 w-11 text-[11px]",
  lg: "h-14 w-14 text-xs",
};

const imgPad = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
};

export function LogoMark({
  initials,
  logoUrl,
  website,
  size = "md",
  className,
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

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates.join("|")]);

  const src = candidates[index] ?? null;
  const showImg = Boolean(src);

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line font-medium tracking-[0.08em] text-ink",
        showImg ? cn("bg-white", imgPad[size]) : "bg-paper",
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          className="h-full w-full object-contain"
          onError={() => {
            setIndex((i) => i + 1);
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
