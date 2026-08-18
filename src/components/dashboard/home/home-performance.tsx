import Link from "next/link";

type Props = {
  analytics: {
    profileViews: number;
    embedViews: number;
    inquiries: number;
  } | null;
  isPro: boolean;
};

export function HomePerformance({ analytics, isPro }: Props) {
  if (!isPro) {
    return (
      <section className="rounded-[20px] border border-line bg-paper px-5 py-5">
        <h2 className="font-display text-[16px] font-medium text-ink">
          Performance
        </h2>
        <p className="mt-2 text-[13px] text-ink-soft">
          Visits, embeds, and inquiries — on Pro.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-3 inline-block text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          See plans →
        </Link>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="rounded-[20px] border border-line bg-surface px-5 py-5">
        <h2 className="font-display text-[16px] font-medium text-ink">
          Last 30 days
        </h2>
        <p className="mt-2 text-[13px] text-muted">No traffic yet.</p>
        <Link
          href="/dashboard/widgets"
          className="mt-3 inline-block text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Set up an embed →
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[20px] border border-line bg-surface px-5 py-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[16px] font-medium text-ink">
          Last 30 days
        </h2>
        <Link
          href="/dashboard/insights"
          className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Insights →
        </Link>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Visits" value={analytics.profileViews} />
        <Stat label="Embeds" value={analytics.embedViews} />
        <Stat label="Inquiries" value={analytics.inquiries} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-display text-[22px] font-medium tabular-nums text-ink">
        {value}
      </dd>
    </div>
  );
}
