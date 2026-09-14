export function AdminFactTiles({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-card border border-line bg-surface px-4 py-3.5 shadow-[0_1px_2px_rgba(8,20,18,0.03)]"
        >
          <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            {label}
          </p>
          <p className="mt-1.5 text-[14px] text-ink">{value}</p>
        </div>
      ))}
    </div>
  );
}
