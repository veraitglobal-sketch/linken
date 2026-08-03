import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedHansalaSeal } from "@/components/embed/embed-linken-seal";
import {
  embedHairlineClass,
  embedInkClass,
  embedMutedClass,
  embedRecordShell,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  confirmedCount: number;
  proofCompanies: EmbedProofCompany[];
  profileUrl: string;
  theme?: EmbedTheme;
};

/**
 * Pro — the network record. The counterparties are named, not reduced to
 * generated initial tiles: a register lists who, not how many avatars fit.
 */
export function EmbedNetworkCard({
  name,
  confirmedCount,
  proofCompanies,
  profileUrl,
  theme = "light",
}: Props) {
  const shown = proofCompanies.slice(0, 4);
  const rest = Math.max(0, proofCompanies.length - shown.length);

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block w-full px-4 py-3.5 no-underline", embedRecordShell(theme))}
    >
      <div className="flex items-baseline justify-between gap-4">
        <p
          className={cn(
            "text-[10px] font-semibold tracking-[0.16em] uppercase",
            embedMutedClass(theme),
          )}
        >
          Confirmed network
        </p>
        <p
          className={cn(
            "font-display text-[1.35rem] leading-none font-medium tracking-[-0.04em] tabular-nums",
            embedInkClass(theme),
          )}
        >
          {confirmedCount}
        </p>
      </div>
      <p
        className={cn(
          "mt-1 text-[14px] font-medium tracking-[-0.02em]",
          embedInkClass(theme),
        )}
      >
        {name}
      </p>

      {shown.length > 0 ? (
        <ul
          className={cn(
            "mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t pt-3 text-[12px]",
            embedHairlineClass(theme),
            embedSoftClass(theme),
          )}
        >
          {shown.map((company, index) => (
            <li key={`${company.name}-${index}`} className="flex items-baseline">
              {index > 0 ? (
                <span className={cn("mr-2", embedMutedClass(theme))} aria-hidden>
                  ·
                </span>
              ) : null}
              <span className="truncate">{company.name}</span>
            </li>
          ))}
          {rest > 0 ? (
            <li className={cn(embedMutedClass(theme))}>· and {rest} more</li>
          ) : null}
        </ul>
      ) : null}

      <div
        className={cn(
          "mt-3 flex items-center justify-between gap-3 border-t pt-3",
          embedHairlineClass(theme),
        )}
      >
        <span className={cn("text-[11px]", embedMutedClass(theme))}>
          Partners and clients, each confirmed by both sides
        </span>
        <EmbedHansalaSeal theme={theme} />
      </div>
    </a>
  );
}
