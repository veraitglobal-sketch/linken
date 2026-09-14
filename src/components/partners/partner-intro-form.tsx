import { requestPartnerIntro } from "@/features/intros/partner-intro-actions";

export function PartnerIntroForm({
  partnerId,
  partnerName,
  back = "/dashboard/partners",
}: {
  partnerId: string;
  partnerName: string;
  back?: string;
}) {
  return (
    <details>
      <summary className="cursor-pointer py-2 text-[12px] font-semibold text-ink underline-offset-2 hover:underline">
        Ask {partnerName} for an intro
      </summary>
      <form
        action={requestPartnerIntro}
        className="mt-1 space-y-2 rounded-xl border border-line bg-white px-3 py-3"
      >
        <input type="hidden" name="partner_id" value={partnerId} />
        <input type="hidden" name="back" value={back} />
        <label className="block text-[11px] font-medium text-muted">
          Who should {partnerName} introduce you to?
          <input
            name="target"
            maxLength={120}
            placeholder="A company or person"
            className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-ink"
          />
        </label>
        <label className="block text-[11px] font-medium text-muted">
          Note
          <textarea
            name="message"
            rows={3}
            maxLength={800}
            placeholder="Why this is relevant."
            className="mt-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-ink"
          />
        </label>
        <button
          type="submit"
          className="h-9 min-w-11 rounded-xl bg-navy px-3 text-[12px] font-semibold text-white"
        >
          Send to {partnerName}
        </button>
      </form>
    </details>
  );
}
