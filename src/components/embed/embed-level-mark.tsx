import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { TrustLevel } from "@/features/trust/score";
import { cn } from "@/lib/cn";

const LEVEL_STYLE: Record<
  TrustLevel,
  { light: string; dark: string; label: string }
> = {
  Member: {
    light: "border-line bg-paper text-muted",
    dark: "border-white/15 bg-white/5 text-white/45",
    label: "Member",
  },
  Established: {
    light: "border-[rgba(31,107,92,0.25)] bg-[rgba(31,107,92,0.08)] text-[#1a5c51]",
    dark: "border-[#7eb8a4]/40 bg-[#7eb8a4]/12 text-[#7eb8a4]",
    label: "Established",
  },
  Trusted: {
    light: "border-ember/35 bg-ember/12 text-[#9a6234]",
    dark: "border-ember/50 bg-ember/20 text-[#f0c090]",
    label: "Trusted",
  },
  Pillar: {
    light: "border-[#0e1f1c] bg-[#0e1f1c] text-white",
    dark: "border-white/50 bg-white text-[#0e1f1c]",
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase",
        dark ? style.dark : style.light,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
