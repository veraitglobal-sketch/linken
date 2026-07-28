import { AdminAuditPageLink } from "@/components/admin/admin-audit-page-link";
import { listAuditLog } from "@/features/admin/audit-queries";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";

export const metadata = { title: "Admin · Audit log" };

const PAGE_SIZE = 50;

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminAuditPage({ searchParams }: Props) {
  await requirePlatformStaff("support");
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const { rows, total } = await listAuditLog(PAGE_SIZE, offset);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
          Audit log
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          {total} staff actions recorded · page {page} of {totalPages}.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] text-muted">
                <th className="px-4 py-2 font-semibold">When</th>
                <th className="px-4 py-2 font-semibold">Actor</th>
                <th className="px-4 py-2 font-semibold">Action</th>
                <th className="px-4 py-2 font-semibold">Target</th>
                <th className="px-4 py-2 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-ink-soft" colSpan={5}>
                    No actions recorded.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-line/60 align-top last:border-0">
                    <td className="px-4 py-3 text-ink-soft">
                      {new Date(row.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {row.actorEmail}
                      <p className="text-[11px] text-muted">{row.roleAtTime}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{row.action}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {row.targetType}
                      {row.targetId ? ` · ${row.targetId}` : ""}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{row.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <AdminAuditPageLink page={page - 1} disabled={page <= 1}>
          ← Previous
        </AdminAuditPageLink>
        <AdminAuditPageLink page={page + 1} disabled={page >= totalPages}>
          Next →
        </AdminAuditPageLink>
      </div>
    </div>
  );
}
