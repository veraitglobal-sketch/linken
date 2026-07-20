import Link from "next/link";
import type { PartnershipRow } from "@/features/partners/inbox";
import { EndPartnershipButton } from "@/components/partners/end-partnership-button";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

type Props = {
  accepted: PartnershipRow[];
};

export function PartnershipAcceptedList({ accepted }: Props) {
  if (accepted.length === 0) return null;

  return (
    <WorkspaceCard>
      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
        Official partners
      </h3>
      <p className="mt-0.5 text-[12px] text-[#64748b]">
        Accepted — shown on Network as a partner link.
      </p>
      <ul className="mt-4 space-y-2">
        {accepted.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8eaee] px-3 py-3"
          >
            <div className="min-w-0">
              <Link
                href={`/c/${row.other.slug}`}
                className="text-[13px] font-semibold text-ink hover:underline"
              >
                {row.other.name}
              </Link>
              <p className="text-[11px] text-[#16a34a]">
                Official
                {!row.other.verified ? " · Needs domain verify" : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <EndPartnershipButton
                partnershipId={row.id}
                back="/dashboard/partners"
              />
              <Link
                href="/dashboard"
                className="text-[11px] font-semibold text-ink underline-offset-2 hover:underline"
              >
                Open graph →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </WorkspaceCard>
  );
}
