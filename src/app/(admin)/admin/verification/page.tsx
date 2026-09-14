import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
      <AdminPageHeader
        title="Verification"
        note={`${rows.length} companies with a verification record · ${staleCount} stale (older than 90 days).`}
      />
      <AdminVerificationTable
        rows={rows}
        canRevoke={roleMeetsMinimum(role, "admin")}
        canGrant={roleMeetsMinimum(role, "owner")}
      />
    </div>
  );
}
