import {
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  href: string;
  linkLabel?: string;
  theme?: EmbedTheme;
  className?: string;
};

/** Quiet eyebrow row for placement embeds — hairline, not a card header. */
export function EmbedPlacementRail({
  label,
  href,
  linkLabel = "Hansala",
  theme = "light",
  className,
}: Props) {
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 border-b pb-2.5",
        dark ? "border-white/10" : "border-[#0e1f1c]/10",
        className,
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold tracking-[0.16em] uppercase",
          embedMutedClass(theme),
        )}
      >
        {label}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "text-[11px] font-medium tracking-[-0.01em] no-underline",
          embedInkClass(theme),
          "opacity-70 transition-opacity hover:opacity-100",
        )}
      >
        {linkLabel}
        <span aria-hidden className="ml-1 text-[#1a5c51]">
          →
        </span>
      </a>
    </div>
  );
}
