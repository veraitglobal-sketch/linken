import { AdminTestimonialsTable } from "@/components/admin/admin-testimonials-table";
import { listAdminTestimonials } from "@/features/admin/queries";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { roleMeetsMinimum } from "@/features/admin/roles";

export const metadata = { title: "Admin · Testimonials" };

export default async function AdminTestimonialsPage() {
  const { role } = await requirePlatformStaff("support");
  const rows = await listAdminTestimonials(200);
  const canModerate = roleMeetsMinimum(role, "admin");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
          Testimonials
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          {rows.length} most recent quotes across all companies.
        </p>
      </div>
      <AdminTestimonialsTable rows={rows} title="All testimonials" canModerate={canModerate} />
    </div>
  );
}
