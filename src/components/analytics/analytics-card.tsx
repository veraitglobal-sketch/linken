import type { AnalyticsSummary } from "@/features/analytics/queries";
import type { CompanyPlan } from "@/features/plan/entitlements";
import { getEntitlements } from "@/features/plan/entitlements";

type Props = {
  analytics: AnalyticsSummary;
  plan: CompanyPlan;
};

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct",
  search: "Search",
  partner: "Partners",
  qr: "QR code",
  embed: "Embed",
  one_pager: "One-pager",
  external: "External",
};

export function AnalyticsCard({ analytics, plan }: Props) {
  const full = getEntitlements(plan).fullAnalytics;
  const maxDay = Math.max(1, ...analytics.byDay.map((d) => d.count));

  return (
    <section className="rounded-[28px] border border-line bg-white px-5 py-6 sm:px-7 sm:py-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1a5c51] uppercase">
        What Linken brings you
      </p>
      <p className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Last {analytics.days} days
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric
          label="Profile visits"
          value={analytics.profileViews}
        />
        <Metric label="Inquiries" value={analytics.inquiries} />
      </div>

      {full ? (
        <div className="mt-5 space-y-5 border-t border-line pt-5">
          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="One-pager views"
              value={analytics.onePagerViews}
            />
            <Metric label="Embed views" value={analytics.embedViews} />
          </div>

          <div>
            <p className="text-[12px] font-medium text-ink">Sources</p>
            <ul className="mt-2 space-y-1.5">
              {(["qr", "embed", "search", "partner", "direct", "one_pager"] as const).map(
                (key) => (
                  <li
                    key={key}
                    className="flex items-center justify-between text-[13px] text-ink-soft"
                  >
                    <span>{SOURCE_LABELS[key]}</span>
                    <span className="font-medium text-ink">
                      {analytics.bySource[key] ?? 0}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium text-ink">Daily trend</p>
            {analytics.byDay.length === 0 ? (
              <p className="mt-2 text-[13px] text-muted">No visits yet.</p>
            ) : (
              <div className="mt-3 flex h-24 items-end justify-start gap-1.5">
                {analytics.byDay.map((d) => (
                  <div
                    key={d.day}
                    title={`${d.day}: ${d.count}`}
                    className="w-2.5 shrink-0 rounded-t-sm bg-[#1a5c51]/80"
                    style={{
                      height: `${Math.max(10, (d.count / maxDay) * 100)}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-line bg-[#f7f8fa] px-4 py-5">
          <div className="pointer-events-none select-none blur-[3px]" aria-hidden>
            <p className="text-[13px] text-ink-soft">
              QR 12 · Search 8 · Partners 5 · Embed 3
            </p>
            <div className="mt-3 flex h-16 items-end gap-1">
              {[40, 70, 35, 90, 55, 60, 45].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-[#1a5c51]/40"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/55 px-4 text-center">
            <p className="text-[13px] font-medium text-ink">
              Detailed sources and trends — Pro coming soon
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-[#f7f8fa] px-4 py-3">
      <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl tracking-[-0.03em] text-ink">
        {value}
      </p>
    </div>
  );
}
