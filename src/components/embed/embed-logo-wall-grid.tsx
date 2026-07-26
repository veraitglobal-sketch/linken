"use client";

import { useRef } from "react";
import { EmbedVerified } from "@/components/embed/embed-verified";
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
  ownerProfileUrl: string;
  ownerCompanyId: string;
  viaHost?: string | null;
  entries: LogoWallEntry[];
  theme?: EmbedTheme;
  siteUrl: string;
  motion?: LogoMotion;
  size?: LogoSize;
};

/** Catalog Logo wall — Hansala Verified on top; motion from settings. */
export function EmbedLogoWallGrid({
  ownerProfileUrl,
  ownerCompanyId,
  viaHost,
  entries,
  theme = "light",
  siteUrl,
  motion = "grid",
  size = "md",
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
      className="box-border flex w-full flex-col gap-5 bg-transparent px-1 py-2"
      data-logo-wall-paused={active ? "false" : "true"}
    >
      <div className="flex justify-center">
        <EmbedVerified profileUrl={ownerProfileUrl} theme={theme} />
      </div>
      {entries.length === 0 ? (
        <p
          className={cn(
            "text-center text-[11px]",
            dark ? "text-white/45" : "text-[#66706b]",
          )}
        >
          No partners on this wall yet
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
        <ul className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 md:grid-cols-4">
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
