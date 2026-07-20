import { NetworkMark } from "@/components/marketing/network-mark";
import {
  embedAccentClass,
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { LogoTile } from "@/components/ui/logo-tile";
import { cn } from "@/lib/cn";

export type EmbedProofCompany = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  website?: string | null;
};

/** Site icon + wordmark — always the same corner signature. */
export function EmbedLinkenMark({
  theme,
  className,
  size = "sm",
}: {
  theme: EmbedTheme;
  className?: string;
  size?: "sm" | "md";
}) {
  const icon = size === "md" ? 16 : 13;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        embedAccentClass(theme),
        className,
      )}
      aria-label="Linken"
    >
      <NetworkMark size={icon} animate={false} className="shrink-0" />
      <span
        className={cn(
          "font-display font-semibold tracking-[-0.03em] leading-none",
          size === "md" ? "text-[13px]" : "text-[11px]",
        )}
      >
        Linken
      </span>
    </span>
  );
}

/** Shield + check — faster than a text capsule. */
export function EmbedVerifiedMark({
  theme,
  className,
  label = "Verified",
}: {
  theme: EmbedTheme;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold leading-none",
        embedAccentClass(theme),
        className,
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M8 1.4 13.2 3.6v4.1c0 3.2-2.2 5.5-5.2 6.5-3-1-5.2-3.3-5.2-6.5V3.6L8 1.4Z"
          fill="currentColor"
          opacity="0.18"
        />
        <path
          d="M8 1.4 13.2 3.6v4.1c0 3.2-2.2 5.5-5.2 6.5-3-1-5.2-3.3-5.2-6.5V3.6L8 1.4Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M5.4 8.1 7.1 9.8l3.5-3.6"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}

/**
 * Confirmed-company stack — our "star row": real firms, not abstract glyphs.
 * Omit entirely when count is 0 (caller responsibility).
 */
export function EmbedProofRow({
  companies,
  total,
  theme,
  className,
  compact = false,
}: {
  companies: EmbedProofCompany[];
  total: number;
  theme: EmbedTheme;
  className?: string;
  /** Tighter layout for badge (~72px). */
  compact?: boolean;
}) {
  if (total <= 0) return null;

  const shown = companies.slice(0, 5);
  const overflow = Math.max(0, total - shown.length);
  const frameTone = theme === "dark" ? "dark" : "light";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center",
        compact ? "gap-2" : "gap-2.5",
        className,
      )}
    >
      {shown.length > 0 ? (
        <ul className="flex shrink-0 items-center pl-0.5" aria-hidden>
          {shown.map((c, i) => (
            <li
              key={`${c.name}-${i}`}
              className={cn(
                i > 0 && "-ml-2",
                "rounded-lg ring-2",
                theme === "dark" ? "ring-[#081412]" : "ring-white",
              )}
              style={{ zIndex: shown.length - i }}
            >
              <LogoTile
                name={c.name}
                initials={c.initials}
                logoUrl={c.logoUrl}
                website={c.website}
                size="xs"
                frameTone={frameTone}
              />
            </li>
          ))}
          {overflow > 0 ? (
            <li
              className={cn(
                "-ml-1.5 flex h-6 min-w-6 items-center justify-center rounded-lg border px-1 text-[9px] font-semibold tabular-nums",
                theme === "dark"
                  ? "border-white/15 bg-[#0e1f1c] text-white/70 ring-2 ring-[#081412]"
                  : "border-line bg-paper text-ink-soft ring-2 ring-white",
              )}
              style={{ zIndex: 0 }}
            >
              +{overflow > 99 ? "99" : overflow}
            </li>
          ) : null}
        </ul>
      ) : null}
      <p className="min-w-0 leading-none">
        <span
          className={cn(
            "font-display font-medium tracking-[-0.03em]",
            compact ? "text-[1.05rem]" : "text-[1.2rem]",
            embedInkClass(theme),
          )}
        >
          {total}
        </span>{" "}
        <span
          className={cn(
            compact ? "text-[10px]" : "text-[11px]",
            embedMutedClass(theme),
          )}
        >
          confirmed {total === 1 ? "relationship" : "relationships"}
        </span>
      </p>
    </div>
  );
}
