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
    <section className="mx-auto mt-4 max-w-[calc(1280px+2.25rem)] px-4 sm:px-[18px]">
      <div className="rounded-[24px] bg-surface px-5 py-5 text-[14px] text-ink-soft ring-1 ring-line/70 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-7">
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
              className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-line transition-colors hover:bg-wash"
            >
              Claim this profile
            </Link>
          ) : (
            <>
              {editable ? (
                <Link
                  href={`/c/${company.slug}/edit`}
                  className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-line transition-colors hover:bg-wash"
                >
                  Edit profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-line transition-colors hover:bg-wash"
                >
                  Sign in to edit
                </Link>
              )}
              <Link
                href={`/c/${company.slug}/press`}
                className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-line transition-colors hover:bg-wash"
              >
                Press kit
              </Link>
            </>
          )}
          <Link
            href={companyReportPath(company.slug)}
            className="inline-flex h-10 items-center rounded-full px-4 font-semibold text-ink ring-1 ring-line transition-colors hover:bg-wash"
          >
            Report incorrect information
          </Link>
        </div>
      </div>
    </section>
  );
}
