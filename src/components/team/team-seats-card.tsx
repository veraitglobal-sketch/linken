import Link from "next/link";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

/** Seats used against the plan's limit — members plus pending invites. */
export function TeamSeatsCard({ used, seats }: { used: number; seats: number }) {
  const pct = Math.min(100, Math.round((used / Math.max(1, seats)) * 100));
  const full = used >= seats;
  return (
    <WorkspaceCard>
      <div className="flex items-baseline justify-between">
        <p className="text-[14px] font-semibold text-ink">Seats</p>
        <p className="font-display text-[20px] font-semibold text-ink tabular-nums">
          {used}
          <span className="text-[14px] font-medium text-muted"> / {seats}</span>
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-mute" aria-hidden>
        <div className={full ? "h-full rounded-full bg-navy" : "h-full rounded-full bg-lime"} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Members and pending invites both use a seat.
        {full ? (
          <>
            {" "}
            <Link href="/dashboard/billing" className="font-semibold text-ink underline-offset-2 hover:underline">
              {seats <= 1 ? "Upgrade to invite" : "Manage plan"}
            </Link>
          </>
        ) : null}
      </p>
    </WorkspaceCard>
  );
}
