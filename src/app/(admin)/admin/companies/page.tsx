import Link from "next/link";
import { AdminCompaniesTable } from "@/components/admin/admin-companies-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminCompanies } from "@/features/admin/companies-list";

export const metadata = { title: "Admin · Companies" };

const PAGE_SIZE = 50;

type Props = { searchParams: Promise<{ offset?: string }> };

export default async function AdminCompaniesPage({ searchParams }: Props) {
  const { offset: offsetParam } = await searchParams;
  const offset = Math.max(0, Number(offsetParam ?? 0) || 0);
  const { rows, hasMore } = await listAdminCompanies(PAGE_SIZE, offset);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Companies"
        note={`Showing ${offset + 1}–${offset + rows.length}.`}
      />
      <AdminCompaniesTable rows={rows} title="All companies" />
      <div className="flex justify-between text-[12px] font-semibold">
        {offset > 0 ? (
          <Link
            href={`/admin/companies?offset=${Math.max(0, offset - PAGE_SIZE)}`}
            className="text-ink underline-offset-2 hover:underline"
          >
            ← Newer
          </Link>
        ) : (
          <span />
        )}
        {hasMore ? (
          <Link
            href={`/admin/companies?offset=${offset + PAGE_SIZE}`}
            className="text-ink underline-offset-2 hover:underline"
          >
            Older →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
