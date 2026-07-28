import Link from "next/link";
import { AdminCompaniesTable } from "@/components/admin/admin-companies-table";
import { AdminStatGrid } from "@/components/admin/admin-stat-grid";
import { AdminTestimonialsTable } from "@/components/admin/admin-testimonials-table";
import {
  getAdminRecentCompanies,
  getAdminRecentTestimonials,
  getAdminStats,
} from "@/features/admin/queries";

export const metadata = { title: "Admin · Overview" };

export default async function AdminOverviewPage() {
  const [stats, companies, testimonials] = await Promise.all([
    getAdminStats(),
    getAdminRecentCompanies(10),
    getAdminRecentTestimonials(10),
  ]);

  if (!stats) {
    return (
      <p className="text-[14px] text-ink-soft">
        Admin data unavailable — check SUPABASE_SERVICE_ROLE_KEY.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
          Platform overview
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          New companies, testimonials, and pending trust workflows.
        </p>
      </div>

      <AdminStatGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <AdminCompaniesTable rows={companies} title="Latest companies" />
          <Link
            href="/admin/companies"
            className="text-[13px] font-semibold text-ember underline-offset-2 hover:underline"
          >
            View all companies →
          </Link>
        </div>
        <div className="space-y-3">
          <AdminTestimonialsTable rows={testimonials} title="Latest testimonials" />
          <Link
            href="/admin/testimonials"
            className="text-[13px] font-semibold text-ember underline-offset-2 hover:underline"
          >
            View all testimonials →
          </Link>
        </div>
      </div>
    </div>
  );
}
