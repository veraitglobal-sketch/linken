import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
import { EmbedProofMarquee } from "@/components/embed/embed-proof-marquee";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
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
  proofCompanies?: EmbedProofCompany[];
  profileUrl: string;
  theme?: EmbedTheme;
};

function Stat({
  label,
  value,
  theme,
}: {
  label: string;
  value: number;
  theme: EmbedTheme;
}) {
  return (
    <div className="min-w-0">
      <p
        className={cn(
          "font-display text-[1.25rem] font-medium leading-none tracking-[-0.03em] tabular-nums",
          embedInkClass(theme),
        )}
      >
        {value}
      </p>
      <p className={cn("mt-1 text-[10px] font-semibold tracking-[0.08em] uppercase", embedMutedClass(theme))}>
        {label}
      </p>
    </div>
  );
}

/** Pro — Hansala Level + evidence breakdown. */
export function EmbedTrustCard({
  name,
  level,
  breakdown,
  confirmedCount,
  proofCompanies = [],
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
        "relative block w-full px-4 py-3.5 no-underline",
        embedPremiumShell(theme, "pro"),
      )}
    >
      <div className="flex items-start justify-between gap-3 pr-14">
        <div className="min-w-0">
          <p className={cn("text-[10px] font-semibold tracking-[0.12em] uppercase", embedMutedClass(theme))}>
            Hansala Level
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <EmbedLevelMark level={level} theme={theme} />
            <p className={cn("truncate text-[12px]", embedSoftClass(theme))}>{name}</p>
          </div>
        </div>
        <p className="text-right leading-none">
          <span className={cn("font-display text-[1.5rem] font-medium tracking-[-0.04em]", embedInkClass(theme))}>
            {confirmedCount}
          </span>
          <span className={cn("ml-1 text-[10px] font-semibold uppercase", embedMutedClass(theme))}>
            total
          </span>
        </p>
      </div>

      <div
        className={cn(
          "mt-3 grid grid-cols-3 gap-3 border-t pt-3",
          dark ? "border-white/10" : "border-[#0e1f1c]/08",
        )}
      >
        <Stat label="Partners" value={breakdown.confirmedPartners} theme={theme} />
        <Stat label="Clients" value={breakdown.confirmedReferences + breakdown.ongoingReferences} theme={theme} />
        <Stat label="Projects" value={breakdown.clientConfirmedCaseStudies} theme={theme} />
      </div>

      {proofCompanies.length > 0 ? (
        <EmbedProofMarquee companies={proofCompanies} theme={theme} className="mt-3" />
      ) : null}

      <EmbedVerifiedLockup
        theme={theme}
        size="sm"
        className="absolute top-3.5 right-3.5 opacity-80"
      />
    </a>
  );
}
