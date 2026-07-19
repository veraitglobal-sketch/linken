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
  profileUrl: string;
  theme?: EmbedTheme;
};

export function EmbedAssessment({
  name,
  wouldYes,
  wouldTotal,
  topStrengths,
  profileUrl,
  theme = "light",
}: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block w-full border px-4 py-3.5 no-underline transition-colors",
        embedShellClass(theme),
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold tracking-[0.12em] uppercase",
          embedAccentClass(theme),
        )}
      >
        Client signals · {name}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-[1.15rem] font-medium tracking-[-0.03em]",
          embedInkClass(theme),
        )}
      >
        {wouldYes} of {wouldTotal} clients would work with them again
      </p>
      {topStrengths.length > 0 ? (
        <p className={cn("mt-1.5 text-[12px]", embedSoftClass(theme))}>
          {topStrengths
            .slice(0, 3)
            .map((s) => `${s.label.toLowerCase()} (${s.count})`)
            .join(" · ")}
        </p>
      ) : null}
      <p
        className={cn(
          "mt-3 text-[11px] font-semibold tracking-[0.1em] uppercase",
          embedMutedClass(theme),
        )}
      >
        Linken
      </p>
    </a>
  );
}
