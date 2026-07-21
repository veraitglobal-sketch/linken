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
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Official partners
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Accepted — shown on Network as a partner link.
          </p>
        </div>
        <p className="text-[12px] font-medium text-plus">
          {accepted.length} official
        </p>
      </header>
      <WorkspaceCard padded={false}>
        <ul className="divide-y divide-line">
          {accepted.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
            >
              <div className="min-w-0">
                <Link
                  href={`/c/${row.other.slug}`}
                  className="text-[14px] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {row.other.name}
                </Link>
                <p className="mt-0.5 text-[12px] text-muted">
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
                  className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Open graph
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </WorkspaceCard>
    </section>
  );
}
