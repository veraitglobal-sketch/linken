import {
  DirectoryCompanyGrid,
  type DirectoryCardCompany,
} from "@/components/search/directory-company-card";
import type { NewCompany } from "@/features/companies/queries-newest";

/**
 * Who joined most recently — a small card each: the logo, what the company
 * does, its own one-line description, and when it arrived.
 *
 * Every card is a real, claimed profile. With none, the row is not drawn.
 */
export function NewCompanies({ companies }: { companies: NewCompany[] }) {
  if (companies.length === 0) return null;

  const cards: DirectoryCardCompany[] = companies.map((c) => ({
    ...c,
    src: "search-new",
  }));

  return (
    <section aria-label="New on Hansala">
      <div className="flex flex-wrap items-end justify-between gap-2 px-1">
        <h2 className="font-display text-[20px] font-semibold tracking-[-0.03em] text-ink sm:text-[22px]">
          New on Hansala
        </h2>
        <p className="text-[13px] text-muted">Companies that joined most recently</p>
      </div>
      <div className="mt-4">
        <DirectoryCompanyGrid companies={cards} />
      </div>
    </section>
  );
}
