import { updateInquiryStatus } from "@/features/inquiries/actions";
import { Badge } from "@/components/ui/badge";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

type Props = {
  inquiries: Inquiry[];
  newCount: number;
  monthCount: number;
};

const STATUS_TONE: Record<InquiryStatus, "neutral" | "success" | "accent"> = {
  new: "accent",
  read: "neutral",
  replied: "success",
  archived: "neutral",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusActions({ id, status }: { id: string; status: InquiryStatus }) {
  const next: { label: string; status: InquiryStatus }[] = [];
  if (status === "new") next.push({ label: "Mark read", status: "read" });
  if (status === "new" || status === "read") {
    next.push({ label: "Mark replied", status: "replied" });
  }
  if (status !== "archived") next.push({ label: "Archive", status: "archived" });

  return (
    <div className="flex flex-wrap gap-1.5">
      {next.map((action) => (
        <form key={action.status} action={updateInquiryStatus}>
          <input type="hidden" name="inquiry_id" value={id} />
          <input type="hidden" name="status" value={action.status} />
          <button
            type="submit"
            className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
          >
            {action.label}
          </button>
        </form>
      ))}
    </div>
  );
}

export function DashboardInquiries({ inquiries, newCount, monthCount }: Props) {
  return (
    <section className="rounded-[28px] border border-line bg-white px-5 py-6 sm:px-7 sm:py-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
        Inquiries
        {newCount > 0 ? ` · ${newCount} new` : ""}
      </p>
      <p className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        {monthCount} inquir{monthCount === 1 ? "y" : "ies"} this month
      </p>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        Leads from visitors who requested a quote on your public page. Reply by
        email.
      </p>

      {inquiries.length === 0 ? (
        <p className="mt-5 text-sm text-muted">
          No inquiries yet. Share your Linken profile to start receiving them.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3 border-t border-line pt-4">
          {inquiries.map((inquiry) => (
            <li
              key={inquiry.id}
              className="rounded-2xl border border-line bg-[#f7f8fa] px-4 py-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {inquiry.senderName}
                    {inquiry.senderCompany ? (
                      <span className="font-normal text-ink-soft">
                        {" "}
                        · {inquiry.senderCompany}
                      </span>
                    ) : null}
                  </p>
                  <a
                    href={`mailto:${inquiry.senderEmail}?subject=${encodeURIComponent("Re: your inquiry on Linken")}`}
                    className="mt-0.5 text-[13px] text-[#1f6b5c] underline-offset-2 hover:underline"
                  >
                    {inquiry.senderEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[inquiry.status]}>{inquiry.status}</Badge>
                  <span className="text-[12px] text-muted">
                    {formatDate(inquiry.createdAt)}
                  </span>
                </div>
              </div>
              {inquiry.serviceInterest ? (
                <p className="mt-2 text-[12px] text-muted">
                  Interested in: {inquiry.serviceInterest}
                </p>
              ) : null}
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {inquiry.message}
              </p>
              <div className="mt-3">
                <StatusActions id={inquiry.id} status={inquiry.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
