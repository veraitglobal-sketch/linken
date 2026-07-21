export type OwnershipSlice = {
  name: string;
  /** Recorded stake — unspecified stakes split the remainder evenly. */
  percentage: number | null;
  type?: string | null;
  primary?: boolean;
};

const COLORS = ["#0e1f1c", "#1a5c51", "#b8895a", "#7eb8a4", "#8a948e", "#c98a1f"];

const TYPE_LABELS: Record<string, string> = {
  equity: "Equity",
  joint_venture: "Joint venture",
  private_equity: "Private equity",
  shareholding: "Shareholding",
  family: "Family ownership",
  other: "Other",
};

/** Fills unspecified stakes so the ring always reads as a full 100%. */
function resolveShares(owners: OwnershipSlice[]): number[] {
  const known = owners.reduce((s, o) => s + (o.percentage ?? 0), 0);
  const unknownCount = owners.filter((o) => o.percentage == null).length;
  const remainder = Math.max(0, 100 - known);
  const fallback = unknownCount > 0 ? remainder / unknownCount : 0;
  return owners.map((o) => o.percentage ?? fallback);
}

/** Dependency-free donut — who owns how much of this firm. */
export function NetworkOwnershipChart({ owners }: { owners: OwnershipSlice[] }) {
  if (owners.length === 0) return null;

  const shares = resolveShares(owners);
  const total = shares.reduce((s, v) => s + v, 0) || 1;
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;

  const cursors = shares.reduce<number[]>((acc, share, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + shares[i - 1]);
    return acc;
  }, []);
  const segments = owners.map((owner, i) => {
    const share = shares[i];
    const length = (share / total) * circumference;
    const dashArray = `${length} ${circumference - length}`;
    const offset = -((cursors[i] / total) * circumference);
    return { owner, share, dashArray, offset, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="mx-3 mt-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        Ownership
      </p>
      <div className="mt-3 flex items-center gap-4">
        <svg width="72" height="72" viewBox="0 0 36 36" className="shrink-0 -rotate-90">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="#eef0ee" strokeWidth="5" />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="5"
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <ul className="min-w-0 flex-1 space-y-1.5">
          {segments.map((seg, i) => (
            <li key={i} className="flex items-center gap-2 text-[12px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate font-medium text-ink">
                {seg.owner.name}
              </span>
              <span className="shrink-0 text-muted">
                {seg.owner.percentage != null
                  ? `${seg.owner.percentage}%`
                  : `~${Math.round(seg.share)}%`}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {owners.some((o) => o.type) ? (
        <p className="mt-2.5 truncate text-[11px] text-muted">
          {owners
            .filter((o) => o.type)
            .map((o) => `${o.name}: ${TYPE_LABELS[o.type!] ?? o.type}`)
            .join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
