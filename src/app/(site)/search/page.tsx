import type { Metadata } from "next";
import { SearchPanel } from "@/components/search/search-panel";

export const metadata: Metadata = {
  title: "Search companies",
  description:
    "Find a company on Hansala. Public profiles show confirmed partners only.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
        Directory
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-[clamp(2rem,4.5vw,3.2rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
        Search companies
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        Find a company by name, category, or city. Public records show
        confirmed partners only.
      </p>
      <div className="mt-10 max-w-2xl">
        <SearchPanel includeUnclaimed searchOnEmpty={false} />
      </div>
    </div>
  );
}
