import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
import { EmbedProofStrip } from "@/components/embed/embed-proof-strip";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
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

/** Pro — Trustpilot TrustScore: big count + strip. No logos. */
export function EmbedScoreBar({
  name,
  level,
  confirmedCount,
  verified,
  profileUrl,
  theme = "light",
}: Props) {
  const stripFill = confirmedCount > 0 ? Math.min(5, confirmedCount) : verified ? 5 : 0;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full items-center gap-4 px-4 py-3 no-underline",
        embedPremiumShell(theme, "pro"),
      )}
    >
      <div className="shrink-0 leading-none">
        <p
          className={cn(
            "font-display text-[2rem] font-medium tracking-[-0.05em] tabular-nums",
            embedInkClass(theme),
          )}
        >
          {confirmedCount}
        </p>
        <p className={cn("mt-1 text-[10px] font-semibold tracking-[0.08em] uppercase", embedMutedClass(theme))}>
          confirmed
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {level !== "Member" ? <EmbedLevelMark level={level} theme={theme} /> : null}
          <EmbedProofStrip filled={stripFill} theme={theme} />
        </div>
        <p className={cn("mt-2 truncate text-[12px]", embedMutedClass(theme))}>{name}</p>
      </div>
      <EmbedVerifiedLockup theme={theme} size="sm" />
    </a>
  );
}
