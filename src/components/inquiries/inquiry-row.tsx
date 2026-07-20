import { InquiryStatusActions } from "@/components/inquiries/inquiry-status-actions";
import { Badge } from "@/components/ui/badge";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

const STATUS_TONE: Record<InquiryStatus, "neutral" | "success" | "accent"> = {
  new: "accent",
  read: "neutral",
  replied: "success",
  archived: "neutral",
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function InquiryRow({
  inquiry,
  index = 0,
}: {
  inquiry: Inquiry;
  index?: number;
}) {
  return (
    <li
      className="linken-widget-enter px-5 py-4 sm:px-6"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">
            {inquiry.senderName}
            {inquiry.senderCompany ? (
              <span className="font-normal text-muted">
                {" "}
                · {inquiry.senderCompany}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[13px] text-ink">{inquiry.senderEmail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={STATUS_TONE[inquiry.status]}>
            {STATUS_LABEL[inquiry.status]}
          </Badge>
          <time className="text-[12px] tabular-nums text-plus">
            {formatDate(inquiry.createdAt)}
          </time>
        </div>
      </div>

      {inquiry.serviceInterest ? (
        <p className="mt-2 text-[12px] font-medium text-ink">
          Interested in: {inquiry.serviceInterest}
        </p>
      ) : null}

      <p className="mt-2 text-[13px] leading-relaxed text-ink">
        {inquiry.message}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={`mailto:${inquiry.senderEmail}?subject=${encodeURIComponent("Re: your inquiry on Linken")}`}
          className="inline-flex h-9 items-center rounded-xl bg-navy px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Reply by email
        </a>
        <InquiryStatusActions id={inquiry.id} status={inquiry.status} />
      </div>
    </li>
  );
}
