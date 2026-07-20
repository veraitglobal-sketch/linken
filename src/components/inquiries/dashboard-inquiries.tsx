import Link from "next/link";
import { InquiryRow } from "@/components/inquiries/inquiry-row";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import type { Inquiry } from "@/types/inquiry";

type Props = {
  inquiries: Inquiry[];
  newCount: number;
  monthCount: number;
  companySlug: string;
};

export function DashboardInquiries({
  inquiries,
  newCount,
  monthCount,
  companySlug,
}: Props) {
  const meta = [
    `${monthCount} this month`,
    newCount > 0 ? `${newCount} new` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <WorkspaceCard padded={false}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper/50 px-5 py-3 sm:px-6">
        <p className="text-[12px] font-medium text-ink">{meta || "No activity"}</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            No inquiries yet
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
            Visitors request quotes from your public profile.
          </p>
          <Link
            href={`/c/${companySlug}`}
            className="mt-4 inline-flex h-9 items-center rounded-xl border border-line px-3.5 text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            View public profile
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {inquiries.map((inquiry, i) => (
            <InquiryRow key={inquiry.id} inquiry={inquiry} index={i} />
          ))}
        </ul>
      )}
    </WorkspaceCard>
  );
}
