import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { TrustLevel } from "@/features/trust/score";
import { cn } from "@/lib/cn";

const LEVEL_STYLE: Record<
  TrustLevel,
  { light: string; dark: string; label: string }
> = {
  Member: {
    light: "border-black/[0.08] bg-black/[0.03] text-[#66706b]",
    dark: "border-white/12 bg-white/[0.04] text-white/45",
    label: "Member",
  },
  Established: {
    light: "border-[#1a5c51]/25 bg-[#1a5c51]/08 text-[#1a5c51]",
    dark: "border-[#7eb8a4]/35 bg-[#7eb8a4]/10 text-[#8fc4b3]",
    label: "Established",
  },
  Trusted: {
    light: "border-[#b8895a]/30 bg-[#b8895a]/10 text-[#8a6234]",
    dark: "border-[#b8895a]/40 bg-[#b8895a]/14 text-[#e0b88a]",
    label: "Trusted",
  },
  Pillar: {
    light: "border-[#0e1f1c] bg-[#0e1f1c] text-white",
    dark: "border-white/45 bg-white text-[#0e1f1c]",
    label: "Pillar",
  },
};

type Props = {
  level: TrustLevel;
  theme?: EmbedTheme;
  className?: string;
};

export function EmbedLevelMark({ level, theme = "light", className }: Props) {
  const style = LEVEL_STYLE[level];
  const dark = theme === "dark";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] uppercase",
        dark ? style.dark : style.light,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
