import { EmbedAttribution, EmbedProBadge } from "@/components/embed/embed-pro-chrome";
import { levelHeadline, levelSubline } from "@/components/embed/embed-level-headline";
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

/**
 * Pro flagship — Trustpilot Starter energy.
 * One headline, one number, one footer. No icon rows.
 */
export function EmbedStarter({
  name,
  level,
  confirmedCount,
  verified,
  profileUrl,
}: Props) {
  const headline = levelHeadline(level, verified);
  const subline = levelSubline(level);
  const countLabel =
    confirmedCount === 1 ? "confirmed relationship" : "confirmed relationships";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block w-full px-5 py-4 no-underline",
        "rounded-2xl border border-[#1a3530]",
        "bg-[linear-gradient(165deg,#0a1412_0%,#0e1f1c_55%,#122820_100%)]",
        "shadow-[0_14px_44px_rgba(8,20,18,0.28),inset_0_1px_0_rgba(126,184,164,0.12)]",
        "transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_18px_52px_rgba(8,20,18,0.34)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <EmbedProBadge dark />
        <EmbedAttribution theme="dark" />
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-[1.65rem] font-medium leading-none tracking-[-0.04em] text-white">
            {headline}
          </p>
          {subline ? (
            <p className="mt-1.5 max-w-[14rem] text-[12px] leading-snug text-white/50">
              {subline}
            </p>
          ) : null}
        </div>
        {confirmedCount > 0 ? (
          <div className="shrink-0 text-right leading-none">
            <p className="font-display text-[2.35rem] font-medium tracking-[-0.05em] text-[#7eb8a4] tabular-nums">
              {confirmedCount}
            </p>
            <p className="mt-1 text-[10px] font-medium tracking-[0.06em] text-white/45 uppercase">
              {countLabel}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <p className="truncate font-display text-[14px] font-medium tracking-[-0.02em] text-white/90">
          {name}
        </p>
        <span className="shrink-0 text-[11px] text-white/40">View profile →</span>
      </div>
    </a>
  );
}
