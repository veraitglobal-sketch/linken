/** Tall rounded source bar — soft caps, no hard edges. */
export function SourceSegmentBar({
  segments,
}: {
  segments: { key: string; label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-[#eef1ef] p-0.5 shadow-[inset_0_1px_2px_rgba(8,20,18,0.06)]">
        {segments.map((s) => {
          const pct = (s.value / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={s.key}
              title={`${s.label}: ${s.value}`}
              className="mx-px h-full first:ml-0 last:mr-0 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${Math.max(pct, s.value > 0 ? 2 : 0)}%`,
                background: `linear-gradient(180deg, ${s.color}ee, ${s.color})`,
              }}
            />
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((s) => (
          <div key={s.key} className="min-w-[5.5rem]">
            <p className="text-[11px] text-muted">{s.label}</p>
            <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink">
              {total === 1 && s.value === 0
                ? "0%"
                : `${Math.round((s.value / total) * 100)}%`}
              <span className="ml-1.5 text-[11px] font-medium text-muted">
                {s.value}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
