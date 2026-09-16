"use client";

import { useState, useTransition } from "react";
import {
  DirectoryCompanyCard,
  DirectoryCompanyGrid,
  type DirectoryCardCompany,
} from "@/components/search/directory-company-card";
import { loadSectorCompaniesPage } from "@/features/search/sector-page-action";

export const SECTOR_PAGE_SIZE = 16;

type Props = {
  initial: DirectoryCardCompany[];
  sectorSlugs: string[];
  total?: number;
};

/** Sector browse — paged 4×4 only when the branch has more than one page. */
export function DirectoryPagedGrid({ initial, sectorSlugs, total }: Props) {
  const knownTotal = total ?? initial.length;

  if (knownTotal <= SECTOR_PAGE_SIZE) {
    return <DirectoryCompanyGrid companies={initial} layout="grid" />;
  }

  return (
    <PagedSectorGrid
      initial={initial}
      sectorSlugs={sectorSlugs}
      knownTotal={knownTotal}
    />
  );
}

function PagedSectorGrid({
  initial,
  sectorSlugs,
  knownTotal,
}: {
  initial: DirectoryCardCompany[];
  sectorSlugs: string[];
  knownTotal: number;
}) {
  const [items, setItems] = useState(initial);
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();
  const pageSize = SECTOR_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(knownTotal / pageSize));
  const slice = items.slice((page - 1) * pageSize, page * pageSize);
  const needsFetch = page * pageSize > items.length && items.length < knownTotal;

  function go(next: number) {
    if (next < 1 || next > totalPages || pending) return;
    if (next * pageSize <= items.length || items.length >= knownTotal) {
      setPage(next);
      return;
    }
    startTransition(async () => {
      const more = await loadSectorCompaniesPage(sectorSlugs, items.length, pageSize);
      setItems((prev) => {
        const seen = new Set(prev.map((c) => c.slug));
        return [...prev, ...more.filter((c) => !seen.has(c.slug))];
      });
      setPage(next);
    });
  }

  if (slice.length === 0) return null;

  return (
    <div className="grid gap-4">
      <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {slice.map((company) => (
          <li key={company.slug}>
            <DirectoryCompanyCard company={company} />
          </li>
        ))}
      </ul>
      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-2 px-1"
          aria-label="Sector pages"
        >
          <button
            type="button"
            disabled={page <= 1 || pending}
            onClick={() => go(page - 1)}
            className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-mute disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 text-[13px] text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || pending || (needsFetch && pending)}
            onClick={() => go(page + 1)}
            className="inline-flex h-9 items-center rounded-full bg-navy px-3.5 text-[13px] font-semibold text-on-navy transition-colors hover:bg-navy-deep disabled:opacity-40"
          >
            {pending ? "Loading…" : "Next"}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
