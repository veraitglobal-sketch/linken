/** Shared tooltip shell for Insights charts. */
export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/60 bg-white/90 px-3.5 py-2.5 shadow-[0_16px_40px_rgba(8,20,18,0.14)] backdrop-blur-md">
      <p className="text-[11px] font-semibold text-[#66706b]">{label}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((p) => (
          <li
            key={p.name}
            className="flex items-center justify-between gap-6 text-[12px]"
          >
            <span className="inline-flex items-center gap-1.5 text-[#66706b]">
              <span
                className="h-2 w-2 rounded-full shadow-[0_0_0_3px_rgba(126,184,164,0.25)]"
                style={{ background: p.color }}
              />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums text-ink">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
