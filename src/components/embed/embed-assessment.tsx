import { EmbedHansalaSeal } from "@/components/embed/embed-linken-seal";
import { EmbedProofStrip } from "@/components/embed/embed-proof-strip";
import {
  embedAccentClass,
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Strength = { label: string; count: number };

type Props = {
  name: string;
  wouldYes: number;
  wouldTotal: number;
  topStrengths: Strength[];
  confirmedCount?: number;
  verified?: boolean;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Pro — assessment score + strengths + proof strip. No logos. */
export function EmbedAssessment({
  name,
  wouldYes,
  wouldTotal,
  topStrengths,
  confirmedCount = 0,
  verified = true,
  profileUrl,
  theme = "light",
}: Props) {
  const strengths = topStrengths.slice(0, 3);
  const stripFill = confirmedCount > 0 ? Math.min(5, confirmedCount) : verified ? 5 : 0;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("relative block w-full border px-4 py-3.5 no-underline", embedShellClass(theme))}
    >
      <p className={cn("text-[10px] font-semibold tracking-[0.12em] uppercase", embedMutedClass(theme))}>
        {name}
      </p>
      <div className="mt-1.5 flex items-end gap-3 pr-16">
        <p className={cn("font-display text-[2.55rem] leading-none font-medium tracking-[-0.04em]", embedInkClass(theme))}>
          {wouldYes}
          <span className={cn("text-[1.35rem] opacity-45", embedMutedClass(theme))}> of {wouldTotal}</span>
        </p>
        <p className={cn("mb-1 max-w-[9.5rem] text-[12px] leading-snug", embedSoftClass(theme))}>
          clients would work again
        </p>
      </div>
      {strengths.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
          {strengths.map((s) => (
            <li key={s.label} className={cn("inline-flex items-center gap-1.5 text-[12px]", embedSoftClass(theme))}>
              <span className={cn("h-1.5 w-1.5 rounded-full bg-current", embedAccentClass(theme))} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3 flex items-center gap-3">
        <EmbedProofStrip filled={stripFill} theme={theme} size="sm" />
        {confirmedCount > 0 ? (
          <p className={cn("text-[12px]", embedMutedClass(theme))}>
            {confirmedCount} confirmed relationships
          </p>
        ) : null}
      </div>
      <EmbedHansalaSeal theme={theme} className="absolute top-1/2 right-3 -translate-y-1/2 border-l-0 pl-0" />
    </a>
  );
}
