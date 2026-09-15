import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCompanyCreditsPanel } from "@/components/admin/admin-company-credits-panel";
import { AdminCompanyVisibility } from "@/components/admin/admin-company-visibility";
import { AdminFactTiles } from "@/components/admin/admin-fact-tiles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
  const canRemove = roleMeetsMinimum(role, "owner");
  const lastCheck = detail.verification?.lastCheck
    ? new Date(detail.verification.lastCheck).toLocaleDateString("en-GB")
    : "—";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={detail.name}
        back={{ href: "/admin/companies", label: "← Companies" }}
        note={
          <>
            /{detail.slug}
            {detail.website ? ` · ${detail.website}` : ""}
            {" · "}
            <Link
              href={`/c/${detail.slug}`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Public profile
            </Link>
            {" · "}
            <Link
              href={`/admin/companies/${detail.id}/support`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Support view
            </Link>
          </>
        }
      />

      <AdminFactTiles
        items={[
          [
            "Status",
            `${detail.claimed ? "Claimed" : "Unclaimed"}${detail.verified ? " · Verified" : ""}${detail.staffHiddenAt ? " · Hidden" : ""}`,
          ],
          ["Plan", detail.plan ?? "free"],
          ["Credits", String(detail.creditsBalance)],
          ["Radar", detail.radar ? "On" : "Off"],
          ["Owner", detail.ownerEmail ?? "—"],
          ["Partners", String(detail.partnersCount)],
          ["Testimonials", String(detail.testimonialsCount)],
          ["Case studies", String(detail.casesCount)],
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="text-[13px] font-semibold text-ink">Public profile</h2>
          <div className="mt-3">
            <AdminCompanyVisibility
              companyId={detail.id}
              companyName={detail.name}
              hiddenAt={detail.staffHiddenAt}
              partnersCount={detail.partnersCount}
              canHide={canWrite}
              canRemove={canRemove}
            />
          </div>
        </section>
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="text-[13px] font-semibold text-ink">Credits & plan</h2>
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
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[13px] font-semibold text-ink">Billing</h2>
            <p className="mt-2 text-[13px] text-ink-soft">
              {detail.billing
                ? `${detail.billing.status ?? "—"} · sub ${detail.billing.subscriptionId ?? "none"}`
                : "No Stripe billing row."}
            </p>
            {detail.billing?.cancelAtPeriodEnd ? (
              <p className="mt-1 text-[12px] text-muted">Cancel at period end.</p>
            ) : null}
          </section>
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[13px] font-semibold text-ink">Verification</h2>
            <p className="mt-2 text-[13px] text-ink-soft">
              {detail.verification
                ? `${detail.verification.method ?? "—"} · last check ${lastCheck}`
                : "No verification row."}
            </p>
          </section>
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[13px] font-semibold text-ink">Credit ledger</h2>
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
          </section>
        </section>
      </div>
    </div>
  );
}
