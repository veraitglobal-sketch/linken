"use client";

import { useEffect, useState } from "react";
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

/** Soft crossfade — one logo at a time. */
export function LogoMotionFade({
  entries,
  siteUrl,
  theme,
  mono,
  size,
}: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (entries.length < 2) return;
    const id = window.setInterval(
      () => setI((n) => (n + 1) % entries.length),
      2400,
    );
    return () => window.clearInterval(id);
  }, [entries.length]);

  const e = entries[i] ?? entries[0];
  if (!e) return null;

  return (
    <div
      className="relative flex min-w-0 flex-1 items-center justify-center"
      style={{ height: LOGO_SIZE_PX[size] + 8 }}
    >
      {entries.map((entry, idx) => (
        <a
          key={entry.slug}
          href={`${siteUrl}/c/${entry.slug}?src=embed`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "absolute inset-0 flex items-center justify-center no-underline transition-opacity duration-700",
            idx === i ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={idx !== i}
          tabIndex={idx === i ? 0 : -1}
        >
          <EmbedBareLogo
            name={entry.name}
            initials={entry.initials}
            logoUrl={entry.showLogo ? entry.logoUrl : null}
            website={entry.website}
            theme={theme}
            mono={mono}
            size={size}
          />
        </a>
      ))}
    </div>
  );
}
