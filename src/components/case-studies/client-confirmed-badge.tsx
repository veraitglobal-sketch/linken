import Link from "next/link";
import { PartnerMark } from "@/components/partners/partner-mark";
import type { ClientConfirmation } from "@/types/client-confirmation";

type Props = {
  confirmation: ClientConfirmation;
};

/** Highest trust signal — distinct from partner “Verified” chips. */
export function ClientConfirmedBadge({ confirmation }: Props) {
  const firm = confirmation.confirmedBy;
  if (!firm) return null;

  return (
    <div className="rounded-[24px] border border-[#c4783a]/35 bg-[linear-gradient(135deg,rgba(196,120,58,0.12),rgba(16,35,31,0.06))] px-5 py-4">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#c4783a] uppercase">
        Confirmed by client
      </p>
      <div className="mt-3 flex items-center gap-3">
        <PartnerMark initials={firm.logoInitials} logoUrl={firm.logoUrl} />
        <div className="min-w-0">
          <Link
            href={`/c/${firm.slug}?src=partner`}
            className="font-display text-lg font-medium tracking-[-0.03em] text-ink hover:underline"
          >
            {firm.name}
          </Link>
          <p className="mt-0.5 text-[13px] text-ink-soft">
            Confirmed this project was delivered for them.
          </p>
        </div>
      </div>
    </div>
  );
}
