import {
  ChannelDonut,
  IntertwinedActivityChart,
  SourceSegmentBar,
  type ChartPoint,
} from "@/components/analytics/charts";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

type Segment = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type Props = {
  points: ChartPoint[];
  sourceSegments: Segment[];
  channelSegments: Segment[];
  topPct: string;
  topLabel: string;
};

export function InsightsFull({
  points,
  sourceSegments,
  channelSegments,
  topPct,
  topLabel,
}: Props) {
  return (
    <div className="space-y-8">
      <section>
        <header className="mb-3">
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Activity over time
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Visits, inquiries, one-pager and embed intertwined.
          </p>
        </header>
        <WorkspaceCard>
          <div className="h-[280px]">
            <IntertwinedActivityChart data={points} />
          </div>
        </WorkspaceCard>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <header className="mb-3">
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
              Traffic sources
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Where profile events came from.
            </p>
          </header>
          <WorkspaceCard>
            {sourceSegments.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted">
                No source data yet.
              </p>
            ) : (
              <SourceSegmentBar segments={sourceSegments} />
            )}
          </WorkspaceCard>
        </section>

        <section>
          <header className="mb-3">
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
              Channel mix
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Profile · one-pager · embed · inquiries.
            </p>
          </header>
          <WorkspaceCard>
            <ChannelDonut
              segments={channelSegments}
              centerValue={topPct}
              centerLabel={topLabel}
            />
          </WorkspaceCard>
        </section>
      </div>
    </div>
  );
}
