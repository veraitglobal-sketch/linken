import { focusRingClass } from "@/components/a11y/focus";
import { cn } from "@/lib/cn";

/** GET form — homepage never fetches the directory. */
export function HomeHeroSearch() {
  return (
    <form action="/search" method="get" className="max-w-md">
      <label htmlFor="hero-company-search" className="sr-only">
        Search companies
      </label>
      <div className="flex h-12 items-center rounded-full border border-white/28 bg-white/[0.08] pr-1 pl-4 focus-within:border-white/48 focus-within:bg-white/[0.12]">
        <input
          id="hero-company-search"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Search companies"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-on-navy outline-none placeholder:text-on-navy-muted"
        />
        <button
          type="submit"
          className={cn(
            "inline-flex h-10 shrink-0 items-center rounded-full bg-white px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-[#f2f4f2]",
            focusRingClass,
          )}
        >
          Search
        </button>
      </div>
    </form>
  );
}
