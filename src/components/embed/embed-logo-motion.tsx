"use client";

import { useRef } from "react";
import { LogoMotionFade } from "@/components/embed/logo-motion-fade";
import { LogoMotionRow } from "@/components/embed/logo-motion-row";
import { LogoMotionStack } from "@/components/embed/logo-motion-stack";
import { LogoMotionSwap } from "@/components/embed/logo-motion-swap";
import { LogoWallMarkLink } from "@/components/embed/logo-wall-mark-link";
import { useLogoWallActive } from "@/components/embed/use-logo-wall-active";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoMotion, LogoSize } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  entries: LogoWallEntry[];
  theme?: EmbedTheme;
  siteUrl: string;
  motion?: LogoMotion;
  size?: LogoSize;
  ownerCompanyId: string;
  viaHost?: string | null;
  className?: string;
};

/** Shared partner-logo motion — no Verified chrome (footer / rotate). */
export function EmbedLogoMotion({
  entries,
  theme = "light",
  siteUrl,
  motion = "row",
  size = "md",
  ownerCompanyId,
  viaHost,
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const active = useLogoWallActive(rootRef);
  const dark = theme === "dark";
  const effective: LogoMotion =
    (motion === "swap-batch" || motion === "swap-random") &&
    entries.length <= 5
      ? "grid"
      : motion;

  const motionProps = {
    entries,
    siteUrl,
    theme,
    mono: true as const,
    size,
    ownerCompanyId,
    viaHost,
  };

  return (
    <div
      ref={rootRef}
      className={cn("min-w-0 flex-1", className)}
      data-logo-wall-paused={active ? "false" : "true"}
    >
      {entries.length === 0 ? (
        <p
          className={cn(
            "text-center text-[11px] font-medium tracking-[-0.01em]",
            dark ? "text-white/40" : "text-[#66706b]",
          )}
        >
          Awaiting confirmed partners
        </p>
      ) : effective === "swap-batch" || effective === "swap-random" ? (
        <LogoMotionSwap
          key={`${effective}:${entries.map((e) => e.id).join(",")}`}
          {...motionProps}
          mode={effective}
        />
      ) : effective === "row" ? (
        <LogoMotionRow {...motionProps} />
      ) : effective === "stack" ? (
        <LogoMotionStack {...motionProps} />
      ) : effective === "fade" && active ? (
        <LogoMotionFade {...motionProps} />
      ) : effective === "fade" ? (
        <div className="flex justify-center">
          {entries[0] ? (
            <LogoWallMarkLink
              entry={entries[0]}
              siteUrl={siteUrl}
              theme={theme}
              size={size}
              ownerCompanyId={ownerCompanyId}
              viaHost={viaHost}
            />
          ) : null}
        </div>
      ) : (
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-center">
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
      )}
    </div>
  );
}
