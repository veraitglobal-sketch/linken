import { cn } from "@/lib/cn";

type Props = {
  showOwnership: boolean;
  showCoOwner: boolean;
  showPartner: boolean;
};

function LegendLine({
  color,
  dashed,
}: {
  color: string;
  dashed?: boolean;
}) {
  return (
    <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden>
      <line
        x1="1"
        y1="4"
        x2="19"
        y2="4"
        stroke={color}
        strokeWidth="1.6"
        strokeDasharray={dashed ? "3 2.5" : undefined}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Small floating key for the map's line colors — only lists what's actually drawn. */
export function NetworkMapLegend({
  showOwnership,
  showCoOwner,
  showPartner,
}: Props) {
  if (!showOwnership && !showCoOwner && !showPartner) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 rounded-2xl px-3 py-2.5",
        "border border-white/80 bg-white/80 shadow-[0_10px_32px_rgba(8,20,18,0.07)] backdrop-blur-xl",
      )}
    >
      {showOwnership ? (
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft">
          <LegendLine color="#0e1f1c" />
          Owns
        </div>
      ) : null}
      {showCoOwner ? (
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft">
          <LegendLine color="#0e1f1c" dashed />
          Shared ownership
        </div>
      ) : null}
      {showPartner ? (
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-soft">
          <LegendLine color="#b8895a" dashed />
          Partner
        </div>
      ) : null}
    </div>
  );
}
