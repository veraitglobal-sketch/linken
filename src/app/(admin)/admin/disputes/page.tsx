import { AdminDisputeOpenForm } from "@/components/admin/admin-dispute-open-form";
import { AdminDisputeResolve } from "@/components/admin/admin-dispute-resolve";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listOpenDisputes } from "@/features/admin/disputes";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { roleMeetsMinimum } from "@/features/admin/roles";

export const metadata = { title: "Admin · Disputes" };

export default async function AdminDisputesPage() {
  const { role } = await requirePlatformStaff("support");
  const canResolve = roleMeetsMinimum(role, "admin");
  const disputes = await listOpenDisputes();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Disputes"
        note={`${disputes.length} open dispute${disputes.length === 1 ? "" : "s"}. Opening a dispute hides the record immediately; the public never sees a “disputed” marker.`}
      />

      <section className="rounded-card border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h3 className="text-[13px] font-semibold text-ink">Open disputes</h3>
        </div>
        {disputes.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">No open disputes.</p>
        ) : (
          <ul className="divide-y divide-line/60">
            {disputes.map((d) => (
              <li key={d.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <p className="text-[13px] text-ink">
                    <span className="font-semibold">{d.recordType}</span> · claimed by{" "}
                    {d.claimantName}
                    {d.counterpartyName ? ` vs. ${d.counterpartyName}` : ""}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-soft">{d.claim}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    Opened {new Date(d.openedAt).toLocaleDateString("en-GB")} · record{" "}
                    {d.recordId}
                  </p>
                </div>
                {canResolve ? (
                  <div className="sm:w-64">
                    <AdminDisputeResolve disputeId={d.id} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {canResolve ? <AdminDisputeOpenForm /> : null}
    </div>
  );
}
