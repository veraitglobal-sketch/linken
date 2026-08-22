import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import type {
  CategorySearchHit,
  CompanySearchHit,
} from "@/features/companies/search-action";

type Props = {
  companies: CompanySearchHit[];
  categories: CategorySearchHit[];
  query: string;
  onPickCategory: (label: string) => void;
};

export function HomeHeroSearchResults({
  companies,
  categories,
  query,
  onPickCategory,
}: Props) {
  const q = query.trim().toLowerCase();
  const cats = categories.filter((c) => c.label.toLowerCase() !== q);
  const empty = companies.length === 0 && cats.length === 0;

  return (
    <div
      id="hero-search-results"
      role="listbox"
      className="absolute top-[calc(100%+8px)] right-0 left-0 z-20 max-h-56 overflow-y-auto rounded-2xl border border-white/15 bg-navy/92 py-1 shadow-chapter"
    >
      {cats.map((cat) => (
        <button
          key={cat.label}
          type="button"
          role="option"
          onClick={() => onPickCategory(cat.label)}
          className="flex min-h-11 w-full items-center gap-3 px-3.5 text-left hover:bg-white/[0.06]"
        >
          <span className="font-label text-[10px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
            Category
          </span>
          <span className="min-w-0 truncate text-[14px] text-on-navy">
            {cat.label}
          </span>
          <span className="ml-auto shrink-0 text-[12px] text-on-navy-muted">
            {cat.count}
          </span>
        </button>
      ))}
      {companies.map((hit) => (
        <Link
          key={hit.id}
          role="option"
          href={`/c/${hit.slug}?src=search`}
          className="flex min-h-11 items-center gap-3 px-3.5 hover:bg-white/[0.06]"
        >
          <LogoMark
            initials={hit.logoInitials}
            logoUrl={hit.logoUrl}
            size="sm"
            className="border-white/15"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-medium text-on-navy">
              {hit.name}
            </span>
            <span className="block truncate text-[12px] text-on-navy-muted">
              {[hit.category, hit.city].filter(Boolean).join(" · ")}
            </span>
          </span>
        </Link>
      ))}
      {empty ? (
        <p className="px-3.5 py-3 text-[13px] text-on-navy-muted">
          No companies match this search.
        </p>
      ) : null}
    </div>
  );
}
