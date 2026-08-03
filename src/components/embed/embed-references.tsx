import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import {
  embedAccentClass,
  embedHairlineClass,
  embedInkClass,
  embedMutedClass,
  embedRecordShell,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

export type EmbedReferenceItem = {
  clientName: string;
  service: string;
  period: string;
  ongoing?: boolean;
  /** Kept for callers; a record prints names, never generated initials. */
  initials?: string;
};

type Props = {
  name: string;
  references: EmbedReferenceItem[];
  totalCount?: number;
  undisclosedCount?: number;
  profileUrl: string;
  theme?: EmbedTheme;
};

/**
 * Pro — the client record, set as a ruled extract rather than a stat card:
 * a title line, one ruled row per confirmed relationship, and the count
 * stated at the foot where a register states its total. Dense on purpose.
 */
export function EmbedReferences({
  name,
  references,
  totalCount,
  undisclosedCount = 0,
  profileUrl,
  theme = "light",
}: Props) {
  const count = totalCount ?? references.length;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block w-full px-3.5 py-3 no-underline", embedRecordShell(theme))}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={cn(
            "text-[9px] font-semibold tracking-[0.16em] uppercase",
            embedMutedClass(theme),
          )}
        >
          Confirmed clients
        </p>
        <p
          className={cn(
            "truncate text-[11px] tracking-[-0.01em]",
            embedSoftClass(theme),
          )}
        >
          {name}
        </p>
      </div>

      <ul className={cn("mt-2.5 border-t", embedHairlineClass(theme))}>
        {references.map((ref) => (
          <li
            key={`${ref.clientName}-${ref.service}`}
            className={cn(
              "flex items-baseline justify-between gap-3 border-b py-2 last:border-b-0",
              embedHairlineClass(theme),
            )}
          >
            <span className="min-w-0">
              <span
                className={cn(
                  "block truncate text-[12px] font-medium tracking-[-0.01em]",
                  embedInkClass(theme),
                )}
              >
                {ref.clientName}
              </span>
              <span
                className={cn(
                  "mt-px block truncate text-[10px]",
                  embedMutedClass(theme),
                )}
              >
                {ref.service}
              </span>
            </span>
            <span
              className={cn(
                "flex shrink-0 items-center gap-1.5 text-[10px] tabular-nums",
                embedSoftClass(theme),
              )}
            >
              {ref.ongoing ? (
                <span
                  className={cn(
                    "inline-block h-1 w-1 rounded-full bg-current",
                    embedAccentClass(theme),
                  )}
                  aria-hidden
                />
              ) : null}
              {ref.period}
            </span>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "flex items-end justify-between gap-3 border-t pt-2.5",
          embedHairlineClass(theme),
        )}
      >
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              "font-display text-[1.6rem] leading-none font-medium tracking-[-0.05em] tabular-nums",
              embedInkClass(theme),
            )}
          >
            {count}
          </span>
          <span className={cn("text-[10px] leading-tight", embedMutedClass(theme))}>
            confirmed by
            <br />
            both sides
            {undisclosedCount > 0 ? ` · ${undisclosedCount} undisclosed` : null}
          </span>
        </span>
        <EmbedVerifiedLockup theme={theme} size="sm" />
      </div>
    </a>
  );
}
