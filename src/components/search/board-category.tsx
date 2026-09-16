import type { DirectoryCardCompany } from "@/components/search/directory-company-card";
import { DirectoryPagedGrid } from "@/components/search/directory-paged-grid";
import { listCompaniesInCategory } from "@/features/companies/queries-category";
import { categoryBySlug } from "@/features/categories/taxonomy";
import { getRanking } from "@/features/ranking/queries";

/**
 * Sector from search — same card strip as “New on Hansala”, titled with the sector name.
 */
export async function BoardCategory({ categorySlug }: { categorySlug: string }) {
  const category = categoryBySlug(categorySlug);
  if (!category) {
    return (
      <section className="px-1 py-10 text-center">
        <p className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink">
          That sector does not exist
        </p>
        <p className="mx-auto mt-2 max-w-[48ch] text-[14px] text-ink-soft">
          Try another sector, or search a company by name above.
        </p>
      </section>
    );
  }

  const [listed, ranked] = await Promise.all([
    listCompaniesInCategory(category.slug, { limit: 16, offset: 0 }),
    getRanking({ categorySlug: category.slug, limit: 80 }),
  ]);
  const companies = orderWithRankedFirst(
    listed.companies,
    ranked?.companies.map((c) => c.slug) ?? [],
  );

  return (
    <section aria-label={category.name}>
      <div className="flex flex-wrap items-end justify-between gap-2 px-1">
        <h2 className="font-display text-[20px] font-semibold tracking-[-0.03em] text-ink sm:text-[22px]">
          {category.name}
        </h2>
        <p className="text-[13px] text-muted">
          {listed.total === 0
            ? "No companies here yet"
            : `${listed.total} ${listed.total === 1 ? "company" : "companies"} in this sector`}
        </p>
      </div>
      {companies.length > 0 ? (
        <div className="mt-4">
          <DirectoryPagedGrid
            initial={companies}
            sectorSlugs={[category.slug]}
            total={listed.total}
          />
        </div>
      ) : (
        <p className="mt-6 max-w-[48ch] px-1 text-[14px] leading-relaxed text-ink-soft">
          When a company joins and picks this sector, it shows up here.
        </p>
      )}
    </section>
  );
}

function orderWithRankedFirst(
  firms: DirectoryCardCompany[],
  rankedSlugs: string[],
): DirectoryCardCompany[] {
  if (rankedSlugs.length === 0) return firms;
  const rank = new Map(rankedSlugs.map((s, i) => [s, i]));
  return [...firms].sort((a, b) => {
    const ai = rank.get(a.slug);
    const bi = rank.get(b.slug);
    if (ai !== undefined && bi !== undefined) return ai - bi;
    if (ai !== undefined) return -1;
    if (bi !== undefined) return 1;
    return 0;
  });
}
