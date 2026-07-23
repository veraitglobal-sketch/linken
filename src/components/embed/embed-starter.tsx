import { EmbedLevelMark } from "@/components/embed/embed-level-mark";
import { EmbedProofStrip } from "@/components/embed/embed-proof-strip";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { TrustLevel } from "@/features/trust/score";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  level: TrustLevel;
  confirmedCount: number;
  verified: boolean;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Pro — Trustpilot Starter: dark premium bar, proof strip, no logos. */
export function EmbedStarter({
  name,
  level,
  confirmedCount,
  verified,
  profileUrl,
  theme = "light",
}: Props) {
  const stripFill = confirmedCount > 0 ? Math.min(5, confirmedCount) : verified ? 5 : 0;
  const dark = theme === "dark";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full flex-col gap-3 px-4 py-3.5 no-underline",
        "rounded-2xl border transition-[transform,box-shadow] duration-200 hover:-translate-y-px",
        dark
          ? "border-white/14 bg-[#050a09] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          : "border-[#0e1f1c] bg-[#0e1f1c] text-white shadow-[0_10px_32px_rgba(10,23,20,0.18)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <EmbedProofStrip filled={stripFill} theme="dark" size="md" />
        {level !== "Member" ? (
          <EmbedLevelMark level={level} theme="dark" />
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-3">
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-medium tracking-[-0.03em] text-white">
            {name}
          </p>
          {confirmedCount > 0 ? (
            <p className="mt-0.5 text-[12px] text-white/55">
              {confirmedCount} mutually confirmed relationships
            </p>
          ) : (
            <p className="mt-0.5 text-[12px] text-white/55">Verified on Hansala</p>
          )}
        </div>
        <EmbedVerifiedLockup theme="dark" size="sm" />
      </div>
    </a>
  );
}
