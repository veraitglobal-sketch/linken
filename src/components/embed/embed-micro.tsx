import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { levelHeadline } from "@/components/embed/embed-level-headline";
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

/** Free micro bar — one status word, one seal. No icon rows. */
export function EmbedMicro({
  name,
  verified,
  claimed,
  level,
  confirmedCount,
  profileUrl,
  theme = "light",
}: Props) {
  const status = levelHeadline(level, verified && claimed);

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex h-[48px] w-full items-center gap-3 px-3.5 no-underline",
        embedShellClass(theme),
      )}
    >
      <span className={cn("shrink-0 text-[13px] font-semibold tracking-[-0.02em]", embedInkClass(theme))}>
        {status}
      </span>
      <span className={cn("min-w-0 flex-1 truncate text-[12px]", embedMutedClass(theme))}>{name}</span>
      {confirmedCount > 0 ? (
        <span className={cn("shrink-0 text-[11px] tabular-nums", embedMutedClass(theme))}>
          {confirmedCount} confirmed
        </span>
      ) : null}
      <EmbedVerifiedLockup theme={theme} size="sm" />
    </a>
  );
}
