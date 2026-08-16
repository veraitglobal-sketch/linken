import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { DeveloperEarnChart } from "@/components/developer/developer-earn-chart";
import { formatCommissionCents } from "@/features/commissions/format";
import type { CommissionMonthPoint } from "@/features/commissions/types";

type Props = {
  series: CommissionMonthPoint[];
  currency: string;
  payingCount: number;
  freeCount: number;
};

/** Accrued € by month — empty months stay on the axis so progress is visible. */
export function DeveloperProgress({
  series,
  currency,
  payingCount,
  freeCount,
}: Props) {
  const yearCents = series.reduce((s, p) => s + p.cents, 0);
  const hasAny = yearCents > 0;

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Progress
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Accrued commission by month — only paid invoices, nothing projected.
          </p>
        </div>
        <p className="text-[12px] font-medium tabular-nums text-plus">
          {formatCommissionCents(yearCents, currency)} · 12 mo
        </p>
      </header>

      <WorkspaceCard padded={false} className="overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <Mini
            label="12-month accrued"
            value={formatCommissionCents(yearCents, currency)}
          />
          <Mini label="Paying" value={String(payingCount)} />
          <Mini label="On free" value={String(freeCount)} />
        </div>

        <div className="px-3 pt-3 pb-2 sm:px-4">
          {hasAny ? (
            <DeveloperEarnChart series={series} currency={currency} />
          ) : (
            <div className="flex h-[180px] flex-col items-center justify-center px-6 text-center sm:h-[200px]">
              <p className="text-[14px] font-medium text-ink">
                No accrued months yet
              </p>
              <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted">
                The graph fills when a referred company pays. Free accounts stay
                attributed — commission starts on their first paid invoice.
              </p>
            </div>
          )}
        </div>
      </WorkspaceCard>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3.5 sm:px-5">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-[18px] font-medium tracking-[-0.03em] tabular-nums text-ink sm:text-[20px]">
        {value}
      </p>
    </div>
  );
}
