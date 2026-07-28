import Link from "next/link";
import { notFound } from "next/navigation";
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

  // Viewing a customer's data is itself an auditable staff action.
  await runAdminAction({
    actor,
    action: "support.view",
    target: { type: "company", id },
    reason: "Opened support view for ticket triage",
    run: async () => ({ result: true }),
  });

  const stats: [string, string][] = [
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
  ];

  return (
    <div className="space-y-6">
      <AdminSupportBanner />

      <div>
        <Link
          href={`/admin/companies/${id}`}
          className="text-[12px] font-semibold text-ember underline-offset-2 hover:underline"
        >
          ← Company detail
        </Link>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
          {detail.name}
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          /{detail.slug}
          {detail.website ? ` · ${detail.website}` : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              {label}
            </p>
            <p className="mt-1 text-[14px] text-ink">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
