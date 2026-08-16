import Link from "next/link";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { DeveloperInstallSnippet } from "@/components/developer/developer-install-snippet";
import { formatCommissionCents } from "@/features/commissions/format";
import type { ReferredClientRow } from "@/features/commissions/types";

function formatSince(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function monthlyLabel(c: ReferredClientRow): string {
  if (c.monthlyCommissionCents <= 0) return "—";
  return formatCommissionCents(c.monthlyCommissionCents);
}

export function DeveloperClients({
  clients,
  siteUrl,
}: {
  clients: ReferredClientRow[];
  siteUrl: string;
}) {
  if (clients.length === 0) return null;

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Paying clients
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Accrued this month from paid invoices — not a projection.
          </p>
        </div>
        <p className="text-[12px] font-medium text-plus">
          {clients.length} paying
        </p>
      </header>
      <WorkspaceCard padded={false}>
        <ul className="divide-y divide-line">
          {clients.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
            >
              <div className="min-w-0">
                <Link
                  href={`/c/${c.slug}`}
                  className="text-[14px] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {c.name}
                </Link>
                <p className="mt-0.5 text-[12px] text-muted">
                  <span className="capitalize">{c.plan}</span>
                  {" · "}
                  Since {formatSince(c.since)}
                  {c.installedVariants.length
                    ? ` · ${c.installedVariants.join(", ")}`
                    : " · No widget live"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-display text-[16px] font-medium tracking-[-0.03em] tabular-nums text-ink">
                  {monthlyLabel(c)}
                </p>
                <DeveloperInstallSnippet slug={c.slug} siteUrl={siteUrl} />
              </div>
            </li>
          ))}
        </ul>
      </WorkspaceCard>
    </section>
  );
}
