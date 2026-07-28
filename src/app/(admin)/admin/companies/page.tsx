import { AdminCompaniesTable } from "@/components/admin/admin-companies-table";
import { listAdminCompanies } from "@/features/admin/queries";

export const metadata = { title: "Admin · Companies" };

export default async function AdminCompaniesPage() {
  const rows = await listAdminCompanies(200);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
          Companies
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          {rows.length} most recent profiles on the platform.
        </p>
      </div>
      <AdminCompaniesTable rows={rows} title="All companies" />
    </div>
  );
}
