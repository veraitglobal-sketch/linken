import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { levelHeadline } from "@/components/embed/embed-level-headline";
import {
  embedBarClass,
  embedInkClass,
  embedMutedClass,
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

/** Free horizontal — universal trust bar for any host site. */
export function EmbedHorizontal({
  name,
  verified,
  level,
  confirmedCount,
  profileUrl,
  theme = "light",
}: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex min-h-[48px] w-full items-center gap-3 px-3.5 py-2 no-underline",
        embedBarClass(theme),
      )}
    >
      <p
        className={cn(
          "min-w-0 truncate text-[13px] font-semibold tracking-[-0.02em]",
          embedInkClass(theme),
        )}
      >
        {name}
      </p>
      {level !== "Member" ? (
        <EmbedLevelMark level={level} theme={theme} />
      ) : (
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold tracking-[0.1em] uppercase",
            embedMutedClass(theme),
          )}
        >
          {levelHeadline(level, verified)}
        </span>
      )}
      {confirmedCount > 0 ? (
        <span className={cn("shrink-0 text-[12px] tabular-nums", embedMutedClass(theme))}>
          <span className={cn("font-semibold", embedInkClass(theme))}>
            {confirmedCount}
          </span>{" "}
          confirmed
        </span>
      ) : null}
      <span className="ml-auto shrink-0">
        <EmbedVerifiedLockup
          theme={theme}
          size="sm"
          subtitle={verified ? "Verified" : "Network"}
        />
      </span>
    </a>
  );
}
