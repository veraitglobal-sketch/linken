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
    <section className="mx-auto mt-10 max-w-[1280px] px-4 sm:px-[18px] lg:px-10">
      <div className="border-t border-ink/10 px-1 pt-6 text-[14px] text-ink-soft sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div className="space-y-1">
          {updated ? (
            <p>
              Profile last updated{" "}
              <time dateTime={company.updatedAt ?? undefined}>{updated}</time>.
            </p>
          ) : (
            <p>Public facts only — pending claims are never shown here.</p>
          )}
          <p className="text-[13px] text-muted">
            Confirmed relationships appear after both companies accept. Hansala
            does not invent clients, quotes, or logos.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
          {isUnclaimed ? (
            <Link
              href={`/c/${company.slug}#claim`}
              className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:bg-surface"
            >
              Claim this profile
            </Link>
          ) : editable ? (
            <Link
              href={`/c/${company.slug}/edit`}
              className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:bg-surface"
            >
              Edit profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:bg-surface"
            >
              Sign in to edit
            </Link>
          )}
          <Link
            href={companyReportPath(company.slug)}
            className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-ink/15 transition-colors hover:bg-surface"
          >
            Report incorrect information
          </Link>
        </div>
      </div>
    </section>
  );
}
