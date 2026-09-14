import { notFound } from "next/navigation";
import { AdminFactTiles } from "@/components/admin/admin-fact-tiles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSupportBanner } from "@/components/admin/admin-support-banner";
import { getAdminCompanyDetail } from "@/features/admin/company-detail";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { runAdminAction } from "@/features/admin/run-admin-action";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const detail = await getAdminCompanyDetail(id);
  return { title: detail ? `Support · ${detail.name}` : "Admin · Support view" };
}

export default async function AdminCompanySupportPage({ params }: Props) {
  const actor = await requirePlatformStaff("support");
  const { id } = await params;
  const detail = await getAdminCompanyDetail(id);
  if (!detail) notFound();

  await runAdminAction({
    actor,
    action: "support.view",
    target: { type: "company", id },
    reason: "Opened support view for ticket triage",
    run: async () => ({ result: true }),
  });

  return (
    <div className="space-y-6">
      <AdminSupportBanner />
      <AdminPageHeader
        title={detail.name}
        back={{ href: `/admin/companies/${id}`, label: "← Company detail" }}
        note={`/${detail.slug}${detail.website ? ` · ${detail.website}` : ""}`}
      />
      <AdminFactTiles
        items={[
          ["Category", detail.category || "—"],
          ["Location", [detail.city, detail.country].filter(Boolean).join(", ") || "—"],
          ["Plan", detail.plan ?? "free"],
          ["Status", detail.claimed ? "Claimed" : "Unclaimed"],
          [
            "Verification",
            detail.verification?.method
              ? `${detail.verification.method}${detail.verified ? " · verified" : ""}`
              : detail.verified
                ? "Verified"
                : "Not verified",
          ],
          ["Partners", String(detail.partnersCount)],
          ["Testimonials", String(detail.testimonialsCount)],
          ["Case studies", String(detail.casesCount)],
        ]}
      />
    </div>
  );
}
