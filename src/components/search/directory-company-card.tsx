import Link from "next/link";

/** Shape shared by “New on Hansala” and sector search grids. */
export type DirectoryCardCompany = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  place: string;
  logoUrl: string | null;
  initials: string;
  verified: boolean;
  /** ISO date — footer “Joined …”. Omit when unknown. */
  createdAt?: string | null;
  /** Fallback footer when there is no join date. */
  footerLeft?: string | null;
  /** Analytics `src` on the profile link. */
  src?: string;
};

/**
 * One company tile — logo, place, sector pill, summary, view link.
 * Same surface for newest-join and sector browse so boost can land later.
 */
export function DirectoryCompanyCard({ company }: { company: DirectoryCardCompany }) {
  const joined = company.createdAt
    ? new Date(company.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : null;
  const left = joined
    ? `Joined ${joined}`
    : (company.footerLeft ?? null);
  const href = `/c/${company.slug}?src=${company.src ?? "search-card"}`;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[22px] bg-surface p-4 ring-1 ring-line/70 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-26px_rgba(14,31,28,0.4)]"
    >
      <span className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-surface ring-1 ring-line/70">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="grid h-full w-full place-items-center bg-lime-soft font-display text-[15px] font-semibold text-navy">
              {company.initials}
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-display text-[16px] font-semibold tracking-[-0.025em] text-ink">
              {company.name}
            </span>
            {company.verified ? (
              <span
                title="Verified domain"
                className="grid size-4 shrink-0 place-items-center rounded-full bg-lime text-navy"
              >
                <svg width="8" height="8" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="m3.5 8.5 3 3 6-7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ) : null}
          </span>
          {company.place ? (
            <span className="block truncate text-[12.5px] text-muted">
              {company.place}
            </span>
          ) : null}
        </span>
      </span>

      {company.category ? (
        <span className="mt-3 inline-flex h-6 max-w-full items-center self-start truncate rounded-full bg-lime-soft px-2.5 text-[12px] font-semibold text-navy">
          {company.category}
        </span>
      ) : null}

      {company.summary ? (
        <span className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">
          {company.summary}
        </span>
      ) : null}

      <span className="mt-auto flex items-center justify-between gap-2 pt-4 text-[12.5px]">
        <span className="text-muted">{left ?? "\u00a0"}</span>
        <span className="font-semibold text-ink transition-colors group-hover:text-navy">
          View profile →
        </span>
      </span>
    </Link>
  );
}

/** Grid / swipe row used by New on Hansala and sector search. */
export function DirectoryCompanyGrid({
  companies,
  layout = "swipe",
}: {
  companies: DirectoryCardCompany[];
  /** swipe = mobile carousel; grid = fixed columns (sector search). */
  layout?: "swipe" | "grid";
}) {
  if (companies.length === 0) return null;

  if (layout === "grid") {
    return (
      <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <li key={company.slug}>
            <DirectoryCompanyCard company={company} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="-mx-4 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
      {companies.map((company) => (
        <li
          key={company.slug}
          className="w-[80%] shrink-0 snap-start sm:w-auto"
        >
          <DirectoryCompanyCard company={company} />
        </li>
      ))}
    </ul>
  );
}
