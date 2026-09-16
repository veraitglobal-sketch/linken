import { setNetworkDigestOptIn } from "@/features/network/digest-actions";

type Props = { companyId: string; optedIn: boolean };

/** Opt-in for the weekly confirmed-network digest. */
export function NetworkDigestOptIn({ companyId, optedIn }: Props) {
  return (
    <form
      action={setNetworkDigestOptIn}
      className="rounded-[20px] bg-surface px-5 py-4 ring-1 ring-line/70"
    >
      <input type="hidden" name="company_id" value={companyId} />
      <input type="hidden" name="opt_in" value={optedIn ? "0" : "1"} />
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        Network digest
      </p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink">
        {optedIn
          ? "Weekly email is on — profile visits, embed views, and a share tip."
          : "Get a weekly email with profile visits, embed views, and a tip to share pair records."}
      </p>
      <button
        type="submit"
        className="mt-3 inline-flex h-9 items-center rounded-full border border-line bg-wash px-4 text-[13px] font-semibold text-ink"
      >
        {optedIn ? "Turn off" : "Opt in"}
      </button>
    </form>
  );
}
