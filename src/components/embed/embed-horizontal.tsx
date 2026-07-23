import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
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
  level: TrustLevel;
  confirmedCount: number;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Free — Trustpilot Horizontal: name · level · strip · count · seal. No logos. */
export function EmbedHorizontal({
  name,
  verified,
  level,
  confirmedCount,
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
        "flex min-h-[56px] w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 no-underline",
        embedShellClass(theme),
      )}
    >
      <p
        className={cn(
          "shrink-0 font-display text-[14px] font-medium tracking-[-0.03em]",
          embedInkClass(theme),
        )}
      >
        {name}
      </p>
      {level !== "Member" ? (
        <EmbedLevelMark level={level} theme={theme} />
      ) : verified ? (
        <span className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", embedMutedClass(theme))}>
          Verified
        </span>
      ) : null}
      <EmbedProofStrip filled={stripFill} theme={theme} />
      {confirmedCount > 0 ? (
        <span className={cn("text-[12px] tabular-nums", embedMutedClass(theme))}>
          <span className={cn("font-display font-medium", embedInkClass(theme))}>
            {confirmedCount}
          </span>{" "}
          confirmed
        </span>
      ) : null}
      <span className="ml-auto shrink-0">
        <EmbedVerifiedLockup theme={theme} size="sm" subtitle="On Hansala" />
      </span>
    </a>
  );
}
