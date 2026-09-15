import type { PricingCompareRow } from "@/features/plan/pricing";

function Cell({ value, pro }: { value: string | boolean; pro?: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-ink">
        <span className={`grid size-5 place-items-center rounded-full ${pro ? "bg-lime" : "bg-lime-soft"} text-navy`}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="m2.5 6.5 2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="sr-only">Included</span>
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

/** Feature table — Free and Pro side by side; scrolls sideways on a phone. */
export function PricingCompare({ rows }: { rows: PricingCompareRow[] }) {
  return (
    <div className="relative overflow-x-auto rounded-[28px] bg-surface ring-1 ring-line/80">
      <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
        <thead>
          <tr>
            <th className="w-[40%] px-6 py-5 text-[13px] font-semibold tracking-[0.12em] text-muted uppercase sm:px-8">
              Feature
            </th>
            <th className="px-6 py-5 font-display text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Free
            </th>
            <th className="bg-lime-soft/60 px-6 py-5 font-display text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Pro
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-t border-line/70">
              <td className="px-6 py-4 align-top sm:px-8">
                <p className="font-semibold text-ink">{row.feature}</p>
                {row.note ? (
                  <p className="mt-1 text-[13px] leading-snug text-muted">{row.note}</p>
                ) : null}
              </td>
              <td className="px-6 py-4 align-top">
                <Cell value={row.free} />
              </td>
              <td className="bg-lime-soft/60 px-6 py-4 align-top">
                <Cell value={row.pro} pro />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
