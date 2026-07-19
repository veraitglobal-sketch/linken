import {
  EmbedLinkenMark,
  EmbedProofRow,
  type EmbedProofCompany,
} from "@/components/embed/embed-brand";
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
  proofCompanies?: EmbedProofCompany[];
  profileUrl: string;
  theme?: EmbedTheme;
};

/** ~120px — room-readable score, mint strengths, proof row. */
export function EmbedAssessment({
  name,
  wouldYes,
  wouldTotal,
  topStrengths,
  confirmedCount = 0,
  proofCompanies = [],
  profileUrl,
  theme = "light",
}: Props) {
  const strengths = topStrengths.slice(0, 3);

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative block w-full border px-4 py-3.5 no-underline",
        embedShellClass(theme),
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold tracking-[0.12em] uppercase",
          embedMutedClass(theme),
        )}
      >
        {name}
      </p>

      <div className="mt-1.5 flex items-end gap-3 pr-16">
        <p
          className={cn(
            "font-display text-[2.55rem] leading-none font-medium tracking-[-0.04em]",
            embedInkClass(theme),
          )}
        >
          {wouldYes}
          <span className={cn("text-[1.35rem] opacity-45", embedMutedClass(theme))}>
            {" "}
            of {wouldTotal}
          </span>
        </p>
        <p
          className={cn(
            "mb-1 max-w-[9.5rem] text-[12px] leading-snug",
            embedSoftClass(theme),
          )}
        >
          clients would work again
        </p>
      </div>

      {strengths.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
          {strengths.map((s) => (
            <li
              key={s.label}
              className={cn(
                "inline-flex items-center gap-1.5 text-[12px]",
                embedSoftClass(theme),
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full bg-current",
                  embedAccentClass(theme),
                )}
                aria-hidden
              />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}

      {confirmedCount > 0 ? (
        <EmbedProofRow
          companies={proofCompanies}
          total={confirmedCount}
          theme={theme}
          compact
          className="mt-3"
        />
      ) : null}

      <EmbedLinkenMark
        theme={theme}
        className="absolute right-3.5 bottom-3"
      />
    </a>
  );
}
