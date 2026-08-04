import { EmbedAttribution } from "@/components/embed/embed-pro-chrome";
import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
import {
  embedInkClass,
  embedMutedClass,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { embedPremiumShell } from "@/components/embed/embed-premium-shell";
import type { TrustBreakdown, TrustLevel } from "@/features/trust/score";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  level: TrustLevel;
  breakdown: TrustBreakdown;
  confirmedCount: number;
  profileUrl: string;
  theme?: EmbedTheme;
};

function Stat({ label, value, theme }: { label: string; value: number; theme: EmbedTheme }) {
  return (
    <div className="min-w-0">
      <p className={cn("font-display text-[1.35rem] font-medium leading-none tabular-nums", embedInkClass(theme))}>
        {value}
      </p>
      <p className={cn("mt-1 text-[9px] font-semibold tracking-[0.08em] uppercase", embedMutedClass(theme))}>
        {label}
      </p>
    </div>
  );
}

/** Pro dossier card — stats that mean something, one Pro badge. */
export function EmbedTrustCard({
  name,
  level,
  breakdown,
  confirmedCount,
  profileUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block w-full px-4 py-4 no-underline", embedPremiumShell(theme, "signature"))}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <EmbedLevelMark level={level} theme={theme} />
          <p className={cn("mt-2 truncate font-display text-[15px] font-medium tracking-[-0.03em]", embedInkClass(theme))}>
            {name}
          </p>
          <p className={cn("mt-0.5 text-[12px]", embedSoftClass(theme))}>
            {confirmedCount} mutually confirmed
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 grid grid-cols-3 gap-4 border-t pt-4",
          dark ? "border-white/10" : "border-[#0e1f1c]/08",
        )}
      >
        <Stat label="Partners" value={breakdown.confirmedPartners} theme={theme} />
        <Stat label="Clients" value={breakdown.confirmedReferences + breakdown.ongoingReferences} theme={theme} />
        <Stat label="Projects" value={breakdown.clientConfirmedCaseStudies} theme={theme} />
      </div>

      <div className="mt-3 flex justify-end">
        <EmbedAttribution theme={theme} />
      </div>
    </a>
  );
}
