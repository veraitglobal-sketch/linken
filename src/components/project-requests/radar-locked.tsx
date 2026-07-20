import { WorkspaceCard } from "@/components/dashboard/workspace-page";

export function RadarLocked() {
  return (
    <WorkspaceCard>
      <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
        Linken Radar
      </p>
      <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
        Coming soon
      </h2>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
        Company leads from saved searches, plus project requests and intros
        (99 €/mo · 15 credits). Unlocks when Radar is enabled for your company.
      </p>
      <p className="mt-3 text-[12px] text-muted">
        Profile inquiries stay free. Radar is never shown on your public
        profile.
      </p>
    </WorkspaceCard>
  );
}
