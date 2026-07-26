import { EmbedHansalaSeal } from "@/components/embed/embed-linken-seal";
import { LogoMotionFade } from "@/components/embed/logo-motion-fade";
import { LogoMotionGrid } from "@/components/embed/logo-motion-grid";
import { LogoMotionRow } from "@/components/embed/logo-motion-row";
import { LogoMotionStack } from "@/components/embed/logo-motion-stack";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoMotion, LogoSize } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

export { EmbedLogoWallProFallback } from "@/components/embed/embed-logo-wall-fallback";

type Props = {
  ownerName: string;
  ownerProfileUrl: string;
  ownerCompanyId: string;
  viaHost?: string | null;
  entries: LogoWallEntry[];
  label: string | null;
  theme?: EmbedTheme;
  mono?: boolean;
  motion?: LogoMotion;
  size?: LogoSize;
  siteUrl: string;
};

/**
 * Clean logo wall — transparent shell, bare marks, motion modes.
 * No card fill behind logos (Viktor / editorial style).
 */
export function EmbedLogoWall({
  ownerName,
  ownerProfileUrl,
  ownerCompanyId,
  viaHost,
  entries,
  label,
  theme = "light",
  mono = true,
  motion = "row",
  size = "md",
  siteUrl,
}: Props) {
  const dark = theme === "dark";
  const motionProps = {
    entries,
    siteUrl,
    theme,
    mono,
    size,
    ownerCompanyId,
    viaHost,
  };

  return (
    <div className="box-border flex w-full flex-col bg-transparent">
      {label ? (
        <p
          className={cn(
            "mb-2 text-[11px] leading-snug",
            dark ? "text-white/55" : "text-[#66706b]",
          )}
        >
          {label}
        </p>
      ) : null}

      <div className="flex min-w-0 items-center gap-3">
        {motion === "stack" ? (
          <LogoMotionStack {...motionProps} />
        ) : motion === "fade" ? (
          <LogoMotionFade {...motionProps} />
        ) : motion === "grid" ? (
          <LogoMotionGrid {...motionProps} />
        ) : (
          <LogoMotionRow {...motionProps} />
        )}

        {motion !== "grid" ? (
          <EmbedHansalaSeal
            theme={theme}
            href={ownerProfileUrl}
            title={`${ownerName} on Hansala`}
            className={cn(
              "border-l pl-3",
              dark ? "border-white/15" : "border-[#e2e6e3]",
            )}
          />
        ) : (
          <a
            href={ownerProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "shrink-0 text-[10px] font-semibold tracking-[0.12em] uppercase no-underline",
              dark ? "text-[#7eb8a4]" : "text-[#1a5c51]",
            )}
          >
            Hansala
          </a>
        )}
      </div>
    </div>
  );
}
