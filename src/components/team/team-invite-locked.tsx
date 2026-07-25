import Link from "next/link";

type Props = {
  maxSeats: number;
};

/** Shown when free (owner-only) or Pro seat cap is full. */
export function TeamInviteLocked({ maxSeats }: Props) {
  const freeOnly = maxSeats <= 1;
  return (
    <div className="rounded-2xl border border-line bg-paper/50 px-5 py-6">
      <p className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
        {freeOnly ? "Team seats require Pro" : "Team seat limit reached"}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        {freeOnly
          ? "Free plans include the owner only. Upgrade to invite teammates."
          : `This company can have up to ${maxSeats} people including pending invites.`}
      </p>
      {freeOnly ? (
        <Link
          href="/dashboard/billing"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-semibold text-white"
        >
          Upgrade on Billing
        </Link>
      ) : null}
    </div>
  );
}
