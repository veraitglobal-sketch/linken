import { EmbedAttribution, EmbedProBadge } from "@/components/embed/embed-pro-chrome";
import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
import { levelHeadline } from "@/components/embed/embed-level-headline";
import {
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { embedPremiumShell } from "@/components/embed/embed-premium-shell";
import type { TrustLevel } from "@/features/trust/score";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  level: TrustLevel;
  confirmedCount: number;
  verified: boolean;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Pro TrustScore — one big number, clear hierarchy. */
export function EmbedScoreBar({
  name,
  level,
  confirmedCount,
  verified,
  profileUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const headline = levelHeadline(level, verified);

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block w-full px-4 py-3.5 no-underline", embedPremiumShell(theme, "pro"))}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 leading-none">
          <p
            className={cn(
              "font-display text-[2.4rem] font-medium tracking-[-0.05em] tabular-nums",
              embedInkClass(theme),
            )}
          >
            {confirmedCount}
          </p>
          <p className={cn("mt-1 text-[9px] font-semibold tracking-[0.1em] uppercase", embedMutedClass(theme))}>
            Confirmed
          </p>
        </div>
        <div className="min-w-0 flex-1 border-l pl-4" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(14,31,28,0.08)" }}>
          <div className="flex flex-wrap items-center gap-2">
            <EmbedProBadge dark={dark} />
            {level !== "Member" ? <EmbedLevelMark level={level} theme={theme} /> : null}
          </div>
          <p className={cn("mt-1.5 font-display text-[16px] font-medium tracking-[-0.03em]", embedInkClass(theme))}>
            {headline}
          </p>
          <p className={cn("mt-0.5 truncate text-[12px]", embedMutedClass(theme))}>{name}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end border-t pt-2.5" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(14,31,28,0.08)" }}>
        <EmbedAttribution theme={theme} />
      </div>
    </a>
  );
}
