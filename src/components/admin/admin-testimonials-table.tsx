import Link from "next/link";
import type { AdminTestimonialRow } from "@/features/admin/types";

type Props = { rows: AdminTestimonialRow[]; title?: string };

function excerpt(body: string, max = 80) {
  const t = body.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export function AdminTestimonialsTable({
  rows,
  title = "Recent testimonials",
}: Props) {
  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] text-muted">
              <th className="px-4 py-2 font-semibold">Company</th>
              <th className="px-4 py-2 font-semibold">Author</th>
              <th className="px-4 py-2 font-semibold">Quote</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold">Provenance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3">
                  {row.companySlug ? (
                    <Link
                      href={`/c/${row.companySlug}#testimonials`}
                      className="font-semibold text-ink underline-offset-2 hover:underline"
                    >
                      {row.companyName}
                    </Link>
                  ) : (
                    row.companyName
                  )}
                  <p className="text-[11px] text-muted">{row.source}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{row.authorName || "—"}</td>
                <td className="max-w-xs px-4 py-3 text-ink-soft">
                  {row.body ? `“${excerpt(row.body)}”` : "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">{row.status}</td>
                <td className="px-4 py-3 text-[12px] text-muted">
                  {row.authorDomain
                    ? `${row.authorDomain}${row.authorDomainVerified ? " · verified" : ""}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
