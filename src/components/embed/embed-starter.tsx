import { EmbedAttribution, EmbedProBadge } from "@/components/embed/embed-pro-chrome";
import { levelHeadline, levelSubline } from "@/components/embed/embed-level-headline";
import { embedPremiumShell } from "@/components/embed/embed-premium-shell";
import {
  embedAccentClass,
  embedHairlineClass,
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
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

/** Pro flagship — one headline, one number, one footer. Host-fit themes. */
export function EmbedStarter({
  name,
  level,
  confirmedCount,
  verified,
  profileUrl,
  theme = "dark",
}: Props) {
  const headline = levelHeadline(level, verified);
  const subline = levelSubline(level);
  const countLabel =
    confirmedCount === 1 ? "confirmed relationship" : "confirmed relationships";
  const dark = theme === "dark";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block w-full px-5 py-4 no-underline", embedPremiumShell(theme, "pro"))}
    >
      <div className="flex items-center justify-between gap-3">
        <EmbedProBadge dark={dark} />
        <EmbedAttribution theme={theme} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              "font-display text-[1.55rem] font-medium leading-none tracking-[-0.04em]",
              embedInkClass(theme),
            )}
          >
            {headline}
          </p>
          {subline ? (
            <p className={cn("mt-1.5 max-w-[14rem] text-[12px] leading-snug", embedMutedClass(theme))}>
              {subline}
            </p>
          ) : null}
        </div>
        {confirmedCount > 0 ? (
          <div className="shrink-0 text-right leading-none">
            <p
              className={cn(
                "font-display text-[2.2rem] font-medium tracking-[-0.05em] tabular-nums",
                embedAccentClass(theme),
              )}
            >
              {confirmedCount}
            </p>
            <p
              className={cn(
                "mt-1 text-[10px] font-medium tracking-[0.06em] uppercase",
                embedMutedClass(theme),
              )}
            >
              {countLabel}
            </p>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-4 flex items-center justify-between gap-3 border-t pt-3",
          embedHairlineClass(theme),
        )}
      >
        <p
          className={cn(
            "truncate text-[13px] font-semibold tracking-[-0.02em]",
            embedInkClass(theme),
          )}
        >
          {name}
        </p>
        <span className={cn("shrink-0 text-[11px]", embedMutedClass(theme))}>
          View profile →
        </span>
      </div>
    </a>
  );
}
