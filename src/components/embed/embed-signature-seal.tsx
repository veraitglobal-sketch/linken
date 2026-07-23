import { NetworkMark } from "@/components/marketing/network-mark";
import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
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

/** Signature — centered premium seal with level + count. */
export function EmbedSignatureSeal({
  name,
  level,
  confirmedCount,
  verified,
  profileUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full flex-col items-center px-5 py-4 text-center no-underline",
        embedPremiumShell(theme, "signature"),
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-[16px] shadow-[0_4px_20px_rgba(10,23,20,0.15)]",
          dark
            ? "bg-white text-[#0e1f1c] shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            : "bg-[#0e1f1c] text-[#7eb8a4]",
        )}
      >
        <NetworkMark size={26} animate={false} />
      </span>

      <p
        className={cn(
          "mt-3 font-display text-[15px] font-semibold tracking-[-0.03em]",
          embedInkClass(theme),
        )}
      >
        Hansala
      </p>
      <p className={cn("mt-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase", embedMutedClass(theme))}>
        {verified ? "Verified company" : "On Hansala"}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {level !== "Member" ? <EmbedLevelMark level={level} theme={theme} /> : null}
        {confirmedCount > 0 ? (
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold tabular-nums",
              dark ? "border-white/15 text-white/70" : "border-[#0e1f1c]/12 text-ink-soft",
            )}
          >
            {confirmedCount} confirmed
          </span>
        ) : null}
      </div>

      <p className={cn("mt-2 max-w-[16rem] truncate text-[11px]", embedMutedClass(theme))}>
        {name}
      </p>
    </a>
  );
}
