import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedProofMarquee } from "@/components/embed/embed-proof-marquee";
import {
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  verified: boolean;
  claimed: boolean;
  confirmedCount?: number;
  proofCompanies?: EmbedProofCompany[];
  profileUrl: string;
  theme?: EmbedTheme;
};

/**
 * Premium micro bar — Hansala seal fixed left, partner logos slide, count right.
 * Not a text chip: proof has to be visible.
 */
export function EmbedCompact({
  name,
  verified,
  claimed,
  confirmedCount = 0,
  proofCompanies = [],
  profileUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const hasLogos = proofCompanies.length > 0;

  return (
    <div
      className={cn(
        "flex h-11 w-full items-center overflow-hidden border pr-2 pl-1.5",
        embedShellClass(theme),
      )}
    >
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-2 py-1 pr-2.5 pl-0.5 no-underline"
        title={`${name} on Hansala`}
      >
        <span
          className={cn(
            "linken-seal-glow flex h-8 w-8 items-center justify-center rounded-[10px]",
            dark
              ? "bg-[#7eb8a4] text-[#081412]"
              : "bg-[#0e1f1c] text-[#7eb8a4]",
          )}
        >
          <NetworkMark size={15} animate={false} />
        </span>
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-display text-[12px] font-semibold tracking-[-0.03em]",
              embedInkClass(theme),
            )}
          >
            Hansala
          </span>
          <span
            className={cn(
              "mt-0.5 text-[8px] font-semibold tracking-[0.14em] uppercase",
              embedMutedClass(theme),
            )}
          >
            {claimed && verified ? "Verified" : claimed ? "Profile" : "Unclaimed"}
          </span>
        </span>
      </a>

      <span
        className={cn(
          "mr-1 h-7 w-px shrink-0",
          dark ? "bg-white/12" : "bg-[#e2e6e3]",
        )}
        aria-hidden
      />

      {hasLogos ? (
        <EmbedProofMarquee
          companies={proofCompanies}
          theme={theme}
          className="min-w-0 flex-1"
        />
      ) : (
        <p
          className={cn(
            "min-w-0 flex-1 truncate px-2 text-[12px] font-medium",
            embedInkClass(theme),
          )}
        >
          {name}
        </p>
      )}

      {confirmedCount > 0 ? (
        <span
          className={cn(
            "ml-1.5 flex shrink-0 items-center gap-1 rounded-full px-2 py-1",
            dark ? "bg-white/8" : "bg-[#0e1f1c]/06",
          )}
        >
          <span
            className={cn(
              "font-display text-[13px] font-medium tracking-[-0.03em] tabular-nums",
              embedInkClass(theme),
            )}
          >
            {confirmedCount}
          </span>
          <span className={cn("text-[9px] font-semibold uppercase", embedMutedClass(theme))}>
            links
          </span>
        </span>
      ) : null}
    </div>
  );
}
