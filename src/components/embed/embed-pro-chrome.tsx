import type { EmbedTheme } from "@/components/embed/embed-theme";
import { embedMutedClass } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  theme?: EmbedTheme;
  className?: string;
};

/** Single-line brand footer — headline already carries Verified/trust level. */
export function EmbedAttribution({ theme = "light", className }: Props) {
  const dark = theme === "dark";
  return (
    <span
      className={cn(
        "font-display text-[10px] font-semibold tracking-[0.08em] uppercase",
        dark ? "text-white/45" : embedMutedClass(theme),
        className,
      )}
    >
      Hansala
    </span>
  );
}

/** Pro tier marker — visible prestige, not extra favicons. */
export function EmbedProBadge({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] uppercase",
        dark
          ? "bg-[#7eb8a4]/20 text-[#7eb8a4]"
          : "bg-[#0e1f1c] text-[#7eb8a4]",
      )}
    >
      Pro
    </span>
  );
}
