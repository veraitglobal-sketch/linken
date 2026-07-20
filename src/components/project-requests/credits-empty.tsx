import { WorkspaceCard } from "@/components/dashboard/workspace-page";

export function CreditsEmpty() {
  return (
    <WorkspaceCard>
      <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
        Credits
      </p>
      <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
        Get credits
      </h2>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
        99 €/mo including 15 credits. Until checkout ships, ask Linken to grant
        credits for your company.
      </p>
      <p className="mt-3 text-[12px] text-muted">
        Profile inquiries stay free. Credits apply only to Radar marketplace
        requests and intros.
      </p>
    </WorkspaceCard>
  );
}
