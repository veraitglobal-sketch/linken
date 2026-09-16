import Link from "next/link";
import { AdminCompanyCreditsPanel } from "@/components/admin/admin-company-credits-panel";
import { AdminCompanyVisibility } from "@/components/admin/admin-company-visibility";
import { AdminDeleteLoginForm } from "@/components/admin/admin-delete-login-form";
import { AdminMergeForm } from "@/components/admin/admin-merge-form";
import type { AdminCompanyDetail } from "@/features/admin/types";
import type { DuplicateCandidate } from "@/features/admin/duplicates";

type Props = {
  detail: AdminCompanyDetail;
  canWrite: boolean;
  canRemove: boolean;
  lastCheck: string;
  ownerIsStaff: boolean;
  sameDomain: { domain: string; peers: DuplicateCandidate[] } | null;
  mergeCompanies: DuplicateCandidate[] | null;
};

export function AdminCompanyOps({
  detail,
  canWrite,
  canRemove,
  lastCheck,
  ownerIsStaff,
  sameDomain,
  mergeCompanies,
}: Props) {
  return (
    <>
      {ownerIsStaff ? (
        <p className="rounded-xl border border-line bg-mute px-4 py-3 text-[13px] text-ink-soft">
          Owner email is also platform staff. Staff accounts must not own company
          profiles — clear ownership or delete the login.
        </p>
      ) : null}

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
              staffPlanLock={detail.staffPlanLock}
              canWrite={canWrite}
            />
          </div>
        </section>

        {detail.ownerEmail ? (
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[13px] font-semibold text-ink">Account</h2>
            <div className="mt-3">
              <AdminDeleteLoginForm
                companyId={detail.id}
                ownerEmail={detail.ownerEmail}
                canDelete={canRemove}
              />
            </div>
          </section>
        ) : null}

        {mergeCompanies && canWrite && sameDomain ? (
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[13px] font-semibold text-ink">
              Same domain ({sameDomain.domain})
            </h2>
            <p className="mt-1 text-[12px] text-muted">
              {sameDomain.peers.length} other profile
              {sameDomain.peers.length === 1 ? "" : "s"} on this domain.
            </p>
            <ul className="mt-3 space-y-1 text-[12px] text-ink-soft">
              {sameDomain.peers.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/companies/${p.id}`}
                    className="font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    {p.name}
                  </Link>
                  {` · /${p.slug} · ${p.claimed ? "claimed" : "unclaimed"}`}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <AdminMergeForm
                companies={mergeCompanies}
                defaultWinnerId={detail.id}
              />
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-[13px] font-semibold text-ink">Billing</h2>
            <p className="mt-2 text-[13px] text-ink-soft">
              {detail.billing
                ? `${detail.billing.status ?? "—"} · sub ${detail.billing.subscriptionId ?? "none"}`
                : "No Stripe billing row."}
            </p>
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
    </>
  );
}
