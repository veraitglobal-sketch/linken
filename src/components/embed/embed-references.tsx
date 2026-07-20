import { EmbedLinkenSeal } from "@/components/embed/embed-linken-seal";
import {
  embedAccentClass,
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { LogoTile } from "@/components/ui/logo-tile";
import { cn } from "@/lib/cn";

export type EmbedReferenceItem = {
  clientName: string;
  service: string;
  period: string;
  ongoing?: boolean;
  initials?: string;
  logoUrl?: string | null;
  website?: string | null;
};

type Props = {
  name: string;
  references: EmbedReferenceItem[];
  totalCount?: number;
  profileUrl: string;
  theme?: EmbedTheme;
};

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** ~160px — client tiles, serif count, mint ongoing dot. */
export function EmbedReferences({
  name,
  references,
  totalCount,
  profileUrl,
  theme = "light",
}: Props) {
  const count = totalCount ?? references.length;
  const frameTone = theme === "dark" ? "dark" : "light";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative block w-full border px-3.5 py-3 no-underline",
        embedShellClass(theme),
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p
              className={cn(
                "text-[10px] font-semibold tracking-[0.12em] uppercase",
                embedMutedClass(theme),
              )}
            >
              Confirmed client references
            </p>
            <p
              className={cn(
                "font-display text-[1.35rem] font-medium tracking-[-0.03em] leading-none",
                embedInkClass(theme),
              )}
            >
              {count}
            </p>
          </div>
          <p className={cn("mt-0.5 text-[11px]", embedSoftClass(theme))}>{name}</p>

          <ul className="mt-2.5 space-y-2">
            {references.map((ref) => {
              const initials = ref.initials || initialsFrom(ref.clientName);
              return (
                <li
                  key={`${ref.clientName}-${ref.service}`}
                  className="flex items-center gap-2.5"
                >
                  <LogoTile
                    name={ref.clientName}
                    initials={initials}
                    logoUrl={ref.logoUrl}
                    website={ref.website}
                    size="xs"
                    frameTone={frameTone}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-[12px] font-medium leading-tight",
                        embedInkClass(theme),
                      )}
                    >
                      {ref.clientName}
                    </p>
                    <p
                      className={cn(
                        "truncate text-[11px]",
                        embedMutedClass(theme),
                      )}
                    >
                      {ref.service}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 text-[11px]",
                      embedMutedClass(theme),
                    )}
                  >
                    {ref.ongoing ? (
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full bg-current",
                          embedAccentClass(theme),
                        )}
                        title="Ongoing"
                        aria-label="Ongoing"
                      />
                    ) : null}
                    {ref.period}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <EmbedLinkenSeal theme={theme} />
      </div>
    </a>
  );
}
