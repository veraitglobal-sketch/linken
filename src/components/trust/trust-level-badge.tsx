import { cn } from "@/lib/cn";
import type { TrustLevel } from "@/features/trust/score";

type Props = {
  level: TrustLevel;
  onDark?: boolean;
};

const styles: Record<TrustLevel, { onDark: string; onLight: string }> = {
  Member: {
    onDark: "border-white/20 bg-white/5 text-white/55",
    onLight: "border-line bg-paper text-muted",
  },
  Established: {
    onDark: "border-[#7eb8a4]/40 bg-[#7eb8a4]/12 text-[#7eb8a4]",
    onLight:
      "border-[rgba(31,107,92,0.25)] bg-[rgba(31,107,92,0.08)] text-[#1a5c51]",
  },
  Trusted: {
    onDark: "border-ember/50 bg-ember/20 text-[#f0c090]",
    onLight: "border-ember/35 bg-ember/12 text-[#9a6234]",
  },
  Pillar: {
    onDark:
      "border-white/50 bg-white text-[#0e1f1c] shadow-[0_0_0_1px_rgba(255,255,255,0.2)]",
    onLight: "border-[#0e1f1c] bg-[#0e1f1c] text-white",
  },
};

/** Member stays discrete / optional; higher levels gain weight. */
export function TrustLevelBadge({ level, onDark = false }: Props) {
  if (level === "Member") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase",
        onDark ? styles[level].onDark : styles[level].onLight,
      )}
    >
      Linken {level}
    </span>
  );
}
