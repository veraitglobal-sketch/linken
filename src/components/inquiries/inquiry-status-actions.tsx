import { updateInquiryStatus } from "@/features/inquiries/actions";
import type { InquiryStatus } from "@/types/inquiry";

export function InquiryStatusActions({
  id,
  status,
}: {
  id: string;
  status: InquiryStatus;
}) {
  const next: { label: string; status: InquiryStatus }[] = [];
  if (status === "new") next.push({ label: "Mark read", status: "read" });
  if (status === "new" || status === "read") {
    next.push({ label: "Mark replied", status: "replied" });
  }
  if (status !== "archived") {
    next.push({ label: "Archive", status: "archived" });
  }

  if (next.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {next.map((action) => (
        <form key={action.status} action={updateInquiryStatus}>
          <input type="hidden" name="inquiry_id" value={id} />
          <input type="hidden" name="status" value={action.status} />
          <button
            type="submit"
            className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            {action.label}
          </button>
        </form>
      ))}
    </div>
  );
}
