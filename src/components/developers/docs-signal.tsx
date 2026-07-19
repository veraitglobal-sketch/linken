/** Capability strip — same pattern as company signal cells. */
export function DocsSignal() {
  const items = [
    {
      label: "Surface",
      value: "REST · JSON",
      note: "Read-only GET",
    },
    {
      label: "Evidence",
      value: "Confirmed only",
      note: "Same as public profiles",
    },
    {
      label: "Cache",
      value: "5 minutes",
      note: "stale-while-revalidate",
    },
    {
      label: "Access",
      value: "Open CORS",
      note: "No API key required",
    },
  ];

  return (
    <div className="mt-4 grid overflow-hidden rounded-[28px] border border-line bg-surface grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={
            i === 0
              ? "px-6 py-6 sm:px-7"
              : "border-t border-line px-6 py-6 sm:border-t-0 sm:border-l sm:px-7"
          }
        >
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            {item.label}
          </p>
          <p className="mt-3 font-display text-[clamp(1.25rem,2vw,1.55rem)] font-medium tracking-[-0.035em] text-ink">
            {item.value}
          </p>
          <p className="mt-1.5 text-[13px] text-ink-soft">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
