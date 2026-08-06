import type { PricingCompareRow } from "@/features/plan/pricing";

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="font-medium text-[#1a5c51]" aria-label="Included">
        Included
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="text-muted" aria-label="Not included">
        —
      </span>
    );
  }
  return <span className="text-ink-soft">{value}</span>;
}

/** Mobile-first comparison — stacked cards, not a wide table. */
export function PricingCompare({ rows }: { rows: PricingCompareRow[] }) {
  return (
    <div className="mt-10 space-y-3">
      {rows.map((row) => (
        <div
          key={row.feature}
          className="rounded-[20px] border border-line bg-surface px-4 py-4 sm:px-5"
        >
          <p className="font-display text-[15px] font-medium tracking-[-0.015em] text-ink">
            {row.feature}
          </p>
          {row.note ? (
            <p className="mt-1 text-[12px] text-muted">{row.note}</p>
          ) : null}
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-paper px-3 py-2.5">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
                Free
              </dt>
              <dd className="mt-1 text-[13.5px]">
                <Cell value={row.free} />
              </dd>
            </div>
            <div className="rounded-xl bg-[#eef5f2] px-3 py-2.5">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-blue uppercase">
                Pro
              </dt>
              <dd className="mt-1 text-[13.5px]">
                <Cell value={row.pro} />
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
