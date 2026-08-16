import { formatCommissionCents } from "@/features/commissions/format";
import type { CommissionTotals } from "@/features/commissions/queries";

/** Navy chapter — this month is the only large figure on the page. */
export function DeveloperEarnings({ totals }: { totals: CommissionTotals }) {
  const currency = totals.currency || "eur";
  const month = formatCommissionCents(totals.thisMonthCents, currency);
  const total = formatCommissionCents(totals.totalCents, currency);
  const emptyMonth = totals.thisMonthCents <= 0;

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-navy px-6 py-7 text-white shadow-[0_20px_50px_rgba(8,20,18,0.18)] sm:rounded-[28px] sm:px-8 sm:py-9">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 10% 20%, rgba(126,184,164,0.2), transparent 55%)",
        }}
      />
      <div className="relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
          Accrued this month
        </p>
        <p className="mt-3 font-display text-[clamp(2.35rem,4vw,3.1rem)] leading-none font-medium tracking-[-0.045em] tabular-nums">
          {month}
        </p>
        <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/55">
          {emptyMonth
            ? "Nothing accrued yet this month. Figures appear only after a referred company pays an invoice."
            : "10% of paid invoices from companies you referred. Accrued only — nothing projected."}
        </p>
        <p className="mt-8 border-t border-white/10 pt-5 text-[13px] text-white/45">
          Total to date{" "}
          <span className="font-medium tabular-nums text-white/80">{total}</span>
        </p>
      </div>
    </section>
  );
}
