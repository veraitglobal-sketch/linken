import { AdminRateLimitForm } from "@/components/admin/admin-rate-limit-form";
import { AdminSuppressionPanel } from "@/components/admin/admin-suppression-panel";
import {
  listDeliverabilityEvents,
  listEmailVolumeByCompany,
  listSuppressions,
} from "@/features/admin/email-ops";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { roleMeetsMinimum } from "@/features/admin/roles";

export const metadata = { title: "Admin · Email" };

export default async function AdminEmailPage() {
  const { role } = await requirePlatformStaff("support");
  const canWrite = roleMeetsMinimum(role, "admin");
  const [suppressions, events, volume] = await Promise.all([
    listSuppressions(),
    listDeliverabilityEvents(100),
    listEmailVolumeByCompany(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">Email</h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          Suppressions, deliverability signals, and rough per-company send volume.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {canWrite ? (
          <AdminSuppressionPanel rows={suppressions} />
        ) : (
          <section className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="text-[13px] font-semibold text-ink">Suppressions</h3>
            <p className="mt-2 text-[13px] text-ink-soft">
              {suppressions.length} entries. Managing suppressions requires admin role.
            </p>
          </section>
        )}

        <section className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-ink">Deliverability events</h3>
          <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto text-[12px] text-ink-soft">
            {events.length === 0 ? (
              <li>No events recorded.</li>
            ) : (
              events.map((e) => (
                <li key={e.id}>
                  <span className="font-semibold text-ink">{e.eventType}</span>{" "}
                  {e.email || e.domain} ·{" "}
                  {new Date(e.createdAt).toLocaleDateString("en-GB")}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h3 className="text-[13px] font-semibold text-ink">
            Rough send volume by company
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] text-muted">
                <th className="px-4 py-2 font-semibold">Company</th>
                <th className="px-4 py-2 font-semibold">Partnership invites</th>
                <th className="px-4 py-2 font-semibold">Case study confirms</th>
                <th className="px-4 py-2 font-semibold">Reference invites</th>
                <th className="px-4 py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {volume.map((row) => (
                <tr key={row.companyId} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink">{row.companyName}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.partnershipInvites}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.caseStudyConfirmations}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.referenceInvites}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {canWrite ? <AdminRateLimitForm /> : null}
    </div>
  );
}
