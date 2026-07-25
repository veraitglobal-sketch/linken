import { IconLock } from "@/components/dashboard/workspace-icons";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

/** Calm lock screen — Radar waits for a denser company graph. */
export function RadarLockedPanel() {
  return (
    <WorkspaceCard>
      <div className="flex max-w-lg flex-col gap-4 py-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-navy ring-1 ring-line">
          <IconLock />
        </span>
        <div>
          <p className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
            Radar is locked
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Matching only works once enough companies are on Hansala. We keep
            Radar closed for now so it stays useful — not empty noise.
          </p>
        </div>
      </div>
    </WorkspaceCard>
  );
}
