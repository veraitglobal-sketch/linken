import { NetworkMark } from "@/components/marketing/network-mark";
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

/** Signature — one seal, Pro badge, editorial center layout. */
export function EmbedSignatureSeal({
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
      className={cn(
        "flex w-full flex-col items-center px-6 py-5 text-center no-underline",
        embedPremiumShell(theme, "signature"),
      )}
    >
      <EmbedProBadge dark={dark} />

      <span
        className={cn(
          "mt-4 flex h-12 w-12 items-center justify-center rounded-lg ring-1",
          dark
            ? "bg-[#7eb8a4] text-[#081412] ring-[#7eb8a4]/35"
            : "bg-[#0e1f1c] text-[#7eb8a4] ring-black/10",
        )}
      >
        <NetworkMark size={22} animate={false} />
      </span>

      <p className={cn("mt-4 font-display text-[1.35rem] font-medium tracking-[-0.04em]", embedInkClass(theme))}>
        {headline}
      </p>

      <p className={cn("mt-1 max-w-[16rem] truncate text-[13px]", embedMutedClass(theme))}>{name}</p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {level !== "Member" ? <EmbedLevelMark level={level} theme={theme} /> : null}
        {confirmedCount > 0 ? (
          <span className={cn("text-[12px] tabular-nums", embedMutedClass(theme))}>
            {confirmedCount} confirmed
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <EmbedAttribution theme={theme} />
      </div>
    </a>
  );
}
