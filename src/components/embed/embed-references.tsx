import { EmbedHansalaSeal } from "@/components/embed/embed-linken-seal";
import {
  embedAccentClass,
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

export type EmbedReferenceItem = {
  clientName: string;
  service: string;
  period: string;
  ongoing?: boolean;
  initials?: string;
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

function InitialDisc({ initials, theme }: { initials: string; theme: EmbedTheme }) {
  const dark = theme === "dark";
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold",
        dark ? "bg-white/10 text-white/80" : "bg-[#0e1f1c]/06 text-ink-soft",
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/** Pro — client list with initials only, never fetched logos. */
export function EmbedReferences({
  name,
  references,
  totalCount,
  profileUrl,
  theme = "light",
}: Props) {
  const count = totalCount ?? references.length;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("relative block w-full border px-3.5 py-3 no-underline", embedShellClass(theme))}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className={cn("text-[10px] font-semibold tracking-[0.12em] uppercase", embedMutedClass(theme))}>
              Confirmed clients
            </p>
            <p className={cn("font-display text-[1.35rem] font-medium leading-none", embedInkClass(theme))}>
              {count}
            </p>
          </div>
          <p className={cn("mt-0.5 text-[11px]", embedSoftClass(theme))}>{name}</p>
          <ul className="mt-2.5 space-y-2">
            {references.map((ref) => (
              <li key={`${ref.clientName}-${ref.service}`} className="flex items-center gap-2.5">
                <InitialDisc initials={ref.initials || initialsFrom(ref.clientName)} theme={theme} />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-[12px] font-medium", embedInkClass(theme))}>
                    {ref.clientName}
                  </p>
                  <p className={cn("truncate text-[11px]", embedMutedClass(theme))}>{ref.service}</p>
                </div>
                <span className={cn("shrink-0 text-[11px]", embedMutedClass(theme))}>
                  {ref.ongoing ? (
                    <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current", embedAccentClass(theme))} />
                  ) : null}
                  {ref.period}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <EmbedHansalaSeal theme={theme} />
      </div>
    </a>
  );
}
