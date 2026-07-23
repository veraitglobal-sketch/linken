import { EmbedProofStrip } from "@/components/embed/embed-proof-strip";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import {
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import type { TrustLevel } from "@/features/trust/score";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  verified: boolean;
  claimed: boolean;
  level: TrustLevel;
  confirmedCount: number;
  profileUrl: string;
  theme?: EmbedTheme;
};

function levelLabel(level: TrustLevel): string | null {
  if (level === "Member") return null;
  return level;
}

/** Free — Trustpilot Micro: status word + proof strip + Hansala. No logos. */
export function EmbedMicro({
  name,
  verified,
  claimed,
  level,
  confirmedCount,
  profileUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const stripFill = confirmedCount > 0 ? Math.min(5, confirmedCount) : verified ? 5 : 0;
  const status = levelLabel(level) ?? (verified ? "Verified" : claimed ? "On Hansala" : "Unclaimed");

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex h-[52px] w-full items-center gap-3 px-3.5 no-underline",
        embedShellClass(theme),
      )}
    >
      <span
        className={cn(
          "shrink-0 text-[13px] font-semibold tracking-[-0.02em]",
          embedInkClass(theme),
        )}
      >
        {status}
      </span>
      <EmbedProofStrip filled={stripFill} theme={theme} size="sm" />
      <span className={cn("min-w-0 flex-1 truncate text-[12px]", embedMutedClass(theme))}>
        {name}
      </span>
      {confirmedCount > 0 ? (
        <span
          className={cn(
            "shrink-0 text-[11px] tabular-nums",
            dark ? "text-white/55" : "text-muted",
          )}
        >
          {confirmedCount} confirmed
        </span>
      ) : null}
      <EmbedVerifiedLockup theme={theme} size="sm" />
    </a>
  );
}
