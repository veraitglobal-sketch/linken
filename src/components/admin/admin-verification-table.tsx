import { AdminVerificationRowActions } from "@/components/admin/admin-verification-row-actions";
import type { AdminVerificationRow } from "@/features/admin/verification-ops";

type Props = {
  rows: AdminVerificationRow[];
  canRevoke: boolean;
  canGrant: boolean;
};

export function AdminVerificationTable({ rows, canRevoke, canGrant }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-[13px] font-semibold text-ink">Company verifications</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] text-muted">
              <th className="px-4 py-2 font-semibold">Company</th>
              <th className="px-4 py-2 font-semibold">Method</th>
              <th className="px-4 py-2 font-semibold">Verified at</th>
              <th className="px-4 py-2 font-semibold">Last check</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.companyId} className="border-b border-line/60 align-top last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{row.companyName}</p>
                  <p className="text-[11px] text-muted">/{row.companySlug}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{row.method ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {row.verifiedAt ? new Date(row.verifiedAt).toLocaleDateString("en-GB") : "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {row.lastCheck ? new Date(row.lastCheck).toLocaleDateString("en-GB") : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-ink-soft">
                    {row.companyVerified ? "Verified" : "Unverified"}
                  </span>
                  {row.stale ? (
                    <span className="ml-2 rounded-full bg-ember/10 px-2 py-0.5 text-[10px] font-semibold text-ember">
                      Stale
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <AdminVerificationRowActions row={row} canRevoke={canRevoke} canGrant={canGrant} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
