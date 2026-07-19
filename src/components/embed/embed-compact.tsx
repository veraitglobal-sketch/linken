import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/ui/logo-mark";
import {
  embedAccentClass,
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  verified: boolean;
  claimed: boolean;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** One-line recommended embed — name + verified + Linken mark. */
export function EmbedCompact({
  name,
  initials,
  logoUrl,
  verified,
  claimed,
  profileUrl,
  theme = "light",
}: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full items-center gap-2.5 border px-3 py-2 no-underline transition-colors",
        embedShellClass(theme),
      )}
    >
      <LogoMark initials={initials} logoUrl={logoUrl} size="sm" />
      <p className={cn("min-w-0 flex-1 truncate text-[13px] font-semibold", embedInkClass(theme))}>
        {name}
      </p>
      {claimed && verified ? <Badge tone="success">Verified</Badge> : null}
      {!claimed ? (
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold tracking-[0.08em] uppercase",
            embedMutedClass(theme),
          )}
        >
          Unclaimed
        </span>
      ) : null}
      <span
        className={cn(
          "shrink-0 text-[10px] font-semibold tracking-[0.1em] uppercase",
          embedAccentClass(theme),
        )}
      >
        Linken
      </span>
    </a>
  );
}
