import { AdminVerificationTable } from "@/components/admin/admin-verification-table";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { roleMeetsMinimum } from "@/features/admin/roles";
import { listCompanyVerifications } from "@/features/admin/verification-ops";

export const metadata = { title: "Admin · Verification" };

export default async function AdminVerificationPage() {
  const { role } = await requirePlatformStaff("support");
  const rows = await listCompanyVerifications(200);
  const staleCount = rows.filter((r) => r.stale).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
          Verification review
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          {rows.length} companies with a verification record · {staleCount} stale
          (older than 90 days).
        </p>
      </div>
      <AdminVerificationTable
        rows={rows}
        canRevoke={roleMeetsMinimum(role, "admin")}
        canGrant={roleMeetsMinimum(role, "owner")}
      />
    </div>
  );
}
