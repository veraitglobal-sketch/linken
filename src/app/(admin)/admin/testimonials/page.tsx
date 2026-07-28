import { AdminTestimonialsTable } from "@/components/admin/admin-testimonials-table";
import { listAdminTestimonials } from "@/features/admin/queries";

export const metadata = { title: "Admin · Testimonials" };

export default async function AdminTestimonialsPage() {
  const rows = await listAdminTestimonials(200);

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
      <AdminTestimonialsTable rows={rows} title="All testimonials" />
    </div>
  );
}
