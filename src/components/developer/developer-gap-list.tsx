import Link from "next/link";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { DeveloperInstallSnippet } from "@/components/developer/developer-install-snippet";
import type { ReferredClientRow } from "@/features/commissions/types";

/** Free clients earn nothing — the actionable gap list. */
export function DeveloperGapList({
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
            Clients on free earn nothing
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Commission appears only after a paid invoice. Share a snippet while
            they are still on free.
          </p>
        </div>
        <p className="text-[12px] font-medium text-plus">
          {clients.length} on free
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
                  Free
                  {c.installedVariants.length
                    ? ` · ${c.installedVariants.join(", ")}`
                    : " · No widget live"}
                </p>
              </div>
              <DeveloperInstallSnippet slug={c.slug} siteUrl={siteUrl} />
            </li>
          ))}
        </ul>
      </WorkspaceCard>
    </section>
  );
}
