import { EmbedAttribution } from "@/components/embed/embed-pro-chrome";
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
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Pro assessment — score-led, no duplicate marks. */
export function EmbedAssessment({
  name,
  wouldYes,
  wouldTotal,
  topStrengths,
  confirmedCount = 0,
  profileUrl,
  theme = "light",
}: Props) {
  const strengths = topStrengths.slice(0, 3);
  const pct = wouldTotal > 0 ? Math.round((wouldYes / wouldTotal) * 100) : 0;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("relative block w-full border px-4 py-4 no-underline", embedShellClass(theme))}
    >
      <div className="flex items-start justify-end">
        <EmbedAttribution theme={theme} />
      </div>

      <p className={cn("mt-3 text-[10px] font-semibold tracking-[0.12em] uppercase", embedMutedClass(theme))}>
        Client assessment · {name}
      </p>

      <div className="mt-2 flex items-end gap-3">
        <p className={cn("font-display text-[2.75rem] leading-none font-medium tracking-[-0.04em]", embedInkClass(theme))}>
          {pct}%
        </p>
        <p className={cn("mb-1 max-w-[10rem] text-[13px] leading-snug", embedSoftClass(theme))}>
          would work again ({wouldYes} of {wouldTotal})
        </p>
      </div>

      {strengths.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {strengths.map((s) => (
            <li key={s.label} className={cn("inline-flex items-center gap-1.5 text-[12px]", embedSoftClass(theme))}>
              <span className={cn("h-1.5 w-1.5 rounded-full bg-current", embedAccentClass(theme))} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}

      {confirmedCount > 0 ? (
        <p className={cn("mt-3 text-[12px]", embedMutedClass(theme))}>
          {confirmedCount} confirmed relationships on Hansala
        </p>
      ) : null}
    </a>
  );
}
