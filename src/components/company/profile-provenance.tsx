import Link from "next/link";
import type { Company } from "@/types/company";
import { companyReportPath } from "@/features/seo/paths";

type Props = {
  company: Company;
  editable?: boolean;
};

function formatUpdated(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Last updated, claim/edit, and report path — public provenance, no private data. */
export function ProfileProvenance({ company, editable = false }: Props) {
  const updated = formatUpdated(company.updatedAt);
  const isUnclaimed = company.claimed === false;

  return (
    <section className="mx-auto mt-8 max-w-6xl px-4">
      <div className="rounded-2xl border border-line bg-surface/80 px-5 py-4 text-[13px] text-ink-soft sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div className="space-y-1">
          {updated ? (
            <p>
              Profile last updated{" "}
              <time dateTime={company.updatedAt ?? undefined}>{updated}</time>.
            </p>
          ) : (
            <p>Public facts only — pending claims are never shown here.</p>
          )}
          <p className="text-[12px] text-muted">
            Confirmed relationships appear after both companies accept. Hansala
            does not invent clients, quotes, or logos.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 sm:mt-0 sm:justify-end">
          {isUnclaimed ? (
            <Link
              href={`/c/${company.slug}#claim`}
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Claim this profile
            </Link>
          ) : editable ? (
            <Link
              href={`/c/${company.slug}/edit`}
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Edit profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Sign in to edit
            </Link>
          )}
          <Link
            href={companyReportPath(company.slug)}
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            Report incorrect information
          </Link>
        </div>
      </div>
    </section>
  );
}
