import Link from "next/link";
import { AdminCompaniesTable } from "@/components/admin/admin-companies-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  adminCompanyNeedle,
  listAdminCompanies,
} from "@/features/admin/companies-list";

export const metadata = { title: "Admin · Companies" };

const PAGE_SIZE = 50;

type Props = { searchParams: Promise<{ offset?: string; q?: string }> };

export default async function AdminCompaniesPage({ searchParams }: Props) {
  const { offset: offsetParam, q: qRaw } = await searchParams;
  const offset = Math.max(0, Number(offsetParam ?? 0) || 0);
  const q = adminCompanyNeedle(qRaw);
  const { rows, hasMore } = await listAdminCompanies(PAGE_SIZE, offset, q);
  const qs = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Companies"
        note={
          rows.length
            ? `Showing ${offset + 1}–${offset + rows.length}${q ? ` for “${q}”` : ""}.`
            : q
              ? `No companies match “${q}”.`
              : "No companies."
        }
      />
      <form className="flex max-w-md gap-2" action="/admin/companies">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or slug"
          className="h-10 flex-1 rounded-none border border-line bg-surface px-3 text-[13px]"
        />
        <button
          type="submit"
          className="h-10 rounded-full bg-navy px-4 text-[12px] font-semibold text-paper"
        >
          Search
        </button>
      </form>
      <AdminCompaniesTable rows={rows} title="All companies" />
      <div className="flex justify-between text-[12px] font-semibold">
        {offset > 0 ? (
          <Link
            href={`/admin/companies?offset=${Math.max(0, offset - PAGE_SIZE)}${qs}`}
            className="text-ink underline-offset-2 hover:underline"
          >
            ← Newer
          </Link>
        ) : (
          <span />
        )}
        {hasMore ? (
          <Link
            href={`/admin/companies?offset=${offset + PAGE_SIZE}${qs}`}
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
