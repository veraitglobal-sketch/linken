"use client";

import { useEffect, useState } from "react";
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

/** Soft crossfade — one logo at a time. */
export function LogoMotionFade({
  entries,
  siteUrl,
  theme,
  size,
  ownerCompanyId,
  viaHost,
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
        <div
          key={entry.slug}
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-700",
            idx === i ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={idx !== i}
        >
          <LogoWallMarkLink
            entry={entry}
            siteUrl={siteUrl}
            theme={theme}
            size={size}
            ownerCompanyId={ownerCompanyId}
            viaHost={viaHost}
          />
        </div>
      ))}
    </div>
  );
}
