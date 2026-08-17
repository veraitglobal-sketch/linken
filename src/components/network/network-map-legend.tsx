import { cn } from "@/lib/cn";

type Props = {
  showOwnership: boolean;
  showCoOwner: boolean;
  showPartner: boolean;
};

function Swatch({ dashed, dark }: { dashed?: boolean; dark?: boolean }) {
  return (
    <svg width="18" height="6" viewBox="0 0 18 6" aria-hidden>
      <line
        x1="0"
        y1="3"
        x2="18"
        y2="3"
        stroke={dark ? "var(--navy)" : "var(--muted)"}
        strokeWidth="1.25"
        strokeDasharray={dashed ? "2.5 3.5" : undefined}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NetworkMapLegend({
  showOwnership,
  showCoOwner,
  showPartner,
}: Props) {
  const items = [
    showOwnership && { label: "Owns", dark: true },
    showCoOwner && { label: "Shared", dark: true, dashed: true },
    showPartner && { label: "Partner", dashed: true },
  ].filter(Boolean) as {
    label: string;
    dark?: boolean;
    dashed?: boolean;
  }[];

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-4 bottom-4 z-20 flex items-center gap-4 rounded-tile px-3.5 py-2",
        "border border-line bg-surface",
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase"
        >
          <Swatch dashed={item.dashed} dark={item.dark} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
