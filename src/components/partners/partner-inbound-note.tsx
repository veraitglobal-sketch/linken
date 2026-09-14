import { getAnalytics } from "@/features/analytics/queries";

export async function PartnerInboundNote({ companyId }: { companyId: string }) {
  const analytics = await getAnalytics(companyId, 30);
  const embed = analytics.embedClicks;
  const fromPartners = analytics.bySource.partner ?? 0;
  if (embed + fromPartners === 0) return null;
  return (
    <p className="text-[13px] leading-relaxed text-ink-soft">
      Last 30 days:{" "}
      {embed > 0 ? (
        <>
          <span className="font-medium text-ink">{embed}</span> clicks from
          Hansala embeds
        </>
      ) : null}
      {embed > 0 && fromPartners > 0 ? " · " : null}
      {fromPartners > 0 ? (
        <>
          <span className="font-medium text-ink">{fromPartners}</span> visits
          from partner profiles
        </>
      ) : null}
      . If a partner shows your logo, those clicks land here.
    </p>
  );
}
