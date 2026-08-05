import type { PendingTestimonialInvite } from "@/features/testimonials/pending-queries";

const SOURCE_LABEL: Record<string, string> = {
  standalone: "Invite",
  partnership: "Partnership",
  reference: "Reference",
  case_study: "Case study",
};

/** Pending author invites — copy link until they publish. */
export function TestimonialPendingList({
  rows,
}: {
  rows: PendingTestimonialInvite[];
}) {
  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Pending
        </p>
        <p className="mt-1 text-[13px] text-muted">
          Waiting for the author to write and publish. You cannot edit their text.
        </p>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">
                {row.authorEmail || "No email on file"}
              </p>
              <p className="mt-0.5 text-[12px] text-muted">
                {SOURCE_LABEL[row.source] ?? row.source}
                {row.authorCompanyName ? ` · ${row.authorCompanyName}` : ""}
              </p>
            </div>
            <a
              href={row.url}
              className="shrink-0 text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Copy link path
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
