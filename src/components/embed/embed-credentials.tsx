import { EmbedAttribution } from "@/components/embed/embed-pro-chrome";
import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
import {
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { embedPremiumShell } from "@/components/embed/embed-premium-shell";
import type { TrustBreakdown, TrustLevel } from "@/features/trust/score";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  level: TrustLevel;
  breakdown: TrustBreakdown;
  profileUrl: string;
  theme?: EmbedTheme;
};

function Cell({
  value,
  label,
  theme,
}: {
  value: number;
  label: string;
  theme: EmbedTheme;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 py-3 text-center">
      <span className={cn("font-display text-[1.2rem] font-medium leading-none tabular-nums", embedInkClass(theme))}>
        {value}
      </span>
      <span className={cn("mt-1 text-[9px] font-semibold tracking-[0.1em] uppercase", embedMutedClass(theme))}>
        {label}
      </span>
    </div>
  );
}

/** Pro credentials strip — three numbers, one Pro badge. */
export function EmbedCredentials({
  name,
  level,
  breakdown,
  profileUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const projects =
    breakdown.clientConfirmedCaseStudies + breakdown.partnerConfirmedCaseStudies;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block w-full overflow-hidden no-underline", embedPremiumShell(theme, "pro"))}
    >
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <p className={cn("min-w-0 truncate text-[12px] font-medium", embedInkClass(theme))}>
          {name}
        </p>
        <EmbedLevelMark level={level} theme={theme} />
      </div>
      <div
        className={cn(
          "flex divide-x border-t",
          dark ? "divide-white/10 border-white/10" : "divide-[#0e1f1c]/08 border-[#0e1f1c]/08",
        )}
      >
        <Cell value={breakdown.confirmedPartners} label="Partners" theme={theme} />
        <Cell value={breakdown.confirmedReferences + breakdown.ongoingReferences} label="Clients" theme={theme} />
        <Cell value={projects} label="Projects" theme={theme} />
      </div>
      <div className="flex justify-end px-3 py-2">
        <EmbedAttribution theme={theme} />
      </div>
    </a>
  );
}
