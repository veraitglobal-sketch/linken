import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCompanyCreditsPanel } from "@/components/admin/admin-company-credits-panel";
import { getAdminCompanyDetail } from "@/features/admin/company-detail";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { roleMeetsMinimum } from "@/features/admin/roles";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const detail = await getAdminCompanyDetail(id);
  return { title: detail ? `Admin · ${detail.name}` : "Admin · Company" };
}

export default async function AdminCompanyDetailPage({ params }: Props) {
  const { role } = await requirePlatformStaff("support");
  const { id } = await params;
  const detail = await getAdminCompanyDetail(id);
  if (!detail) notFound();

  const canWrite = roleMeetsMinimum(role, "admin");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/companies"
          className="text-[12px] font-semibold text-ember underline-offset-2 hover:underline"
        >
          ← Companies
        </Link>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
          {detail.name}
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          /{detail.slug}
          {detail.website ? ` · ${detail.website}` : ""}
          {" · "}
          <Link
            href={`/c/${detail.slug}`}
            className="font-semibold text-ember underline-offset-2 hover:underline"
          >
            Public profile
          </Link>
          {" · "}
          <Link
            href={`/admin/companies/${detail.id}/support`}
            className="font-semibold text-ember underline-offset-2 hover:underline"
          >
            Support view
          </Link>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Status", `${detail.claimed ? "Claimed" : "Unclaimed"}${detail.verified ? " · Verified" : ""}`],
          ["Plan", detail.plan ?? "free"],
          ["Credits", String(detail.creditsBalance)],
          ["Radar", detail.radar ? "On" : "Off"],
          ["Owner", detail.ownerEmail ?? "—"],
          ["Partners", String(detail.partnersCount)],
          ["Testimonials", String(detail.testimonialsCount)],
          ["Case studies", String(detail.casesCount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface px-4 py-3">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              {label}
            </p>
            <p className="mt-1 text-[14px] text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-[13px] font-semibold text-ink">Credits & plan</h3>
          <div className="mt-3">
            <AdminCompanyCreditsPanel
              companyId={detail.id}
              companyName={detail.name}
              radar={detail.radar}
              plan={detail.plan ?? "free"}
              canWrite={canWrite}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="text-[13px] font-semibold text-ink">Billing</h3>
            <p className="mt-2 text-[13px] text-ink-soft">
              {detail.billing
                ? `${detail.billing.status ?? "—"} · sub ${detail.billing.subscriptionId ?? "none"}`
                : "No Stripe billing row."}
            </p>
            {detail.billing?.cancelAtPeriodEnd ? (
              <p className="mt-1 text-[12px] text-muted">Cancel at period end.</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="text-[13px] font-semibold text-ink">Verification</h3>
            <p className="mt-2 text-[13px] text-ink-soft">
              {detail.verification
                ? `${detail.verification.method ?? "—"} · last check ${
                    detail.verification.lastCheck
                      ? new Date(detail.verification.lastCheck).toLocaleDateString("en-GB")
                      : "—"
                  }`
                : "No verification row."}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="text-[13px] font-semibold text-ink">Credit ledger</h3>
            <ul className="mt-2 space-y-1 text-[12px] text-ink-soft">
              {detail.creditLedger.length === 0 ? (
                <li>No ledger entries.</li>
              ) : (
                detail.creditLedger.slice(0, 10).map((row, i) => (
                  <li key={`${row.createdAt}-${i}`}>
                    {row.delta > 0 ? "+" : ""}
                    {row.delta} · {row.reason} ·{" "}
                    {new Date(row.createdAt).toLocaleDateString("en-GB")}
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
