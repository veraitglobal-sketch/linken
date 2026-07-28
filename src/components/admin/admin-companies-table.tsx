import Link from "next/link";
import type { AdminCompanyRow } from "@/features/admin/types";

type Props = { rows: AdminCompanyRow[]; title?: string };

export function AdminCompaniesTable({ rows, title = "Recent companies" }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] text-muted">
              <th className="px-4 py-2 font-semibold">Company</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold">Plan</th>
              <th className="px-4 py-2 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/companies/${row.id}`}
                    className="font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="text-[11px] text-muted">
                    /{row.slug}
                    {" · "}
                    <Link
                      href={`/c/${row.slug}`}
                      className="underline-offset-2 hover:underline"
                    >
                      Public
                    </Link>
                  </p>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {row.claimed ? "Claimed" : "Unclaimed"}
                  {row.verified ? " · Verified" : ""}
                </td>
                <td className="px-4 py-3 text-ink-soft">{row.plan ?? "free"}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {new Date(row.createdAt).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
