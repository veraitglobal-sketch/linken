import Link from "next/link";
import { HomePanel } from "@/components/dashboard/home/home-panel";

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
      <HomePanel label="Performance">
        <p className="text-[13px] text-ink-soft">
          Visits, embeds, and inquiries — on Pro.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-4 inline-flex h-10 items-center text-[13px] font-semibold text-ink"
        >
          Plans
        </Link>
      </HomePanel>
    );
  }

  if (!analytics) {
    return (
      <HomePanel
        label="Last 30 days"
        meta={
          <Link href="/dashboard/widgets" className="font-semibold text-ink">
            Embed
          </Link>
        }
      >
        <p className="text-[13px] text-muted">No traffic yet.</p>
      </HomePanel>
    );
  }

  return (
    <HomePanel
      label="Last 30 days"
      meta={
        <Link href="/dashboard/insights" className="font-semibold text-ink">
          Insights
        </Link>
      }
    >
      <dl className="grid grid-cols-3 gap-3">
        <Stat label="Visits" value={analytics.profileViews} />
        <Stat label="Embeds" value={analytics.embedViews} />
        <Stat label="Inquiries" value={analytics.inquiries} />
      </dl>
    </HomePanel>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-display text-[22px] font-medium tabular-nums text-ink">
        {value}
      </dd>
    </div>
  );
}
