import Link from "next/link";
import { cn } from "@/lib/cn";

export function SearchModePills({
  mode,
  query,
}: {
  mode: "companies" | "categories";
  query: string;
}) {
  const q = query ? `&q=${encodeURIComponent(query)}` : "";
  const pill =
    "inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold transition-colors";
  return (
    <div className="relative z-10 mt-8 flex justify-center gap-2" role="tablist" aria-label="Search mode">
      <Link
        href={`/search?mode=companies${q}`}
        className={cn(pill, mode === "companies" ? "bg-navy text-on-navy" : "bg-surface/80 text-ink ring-1 ring-ink/10")}
      >
        Find a company
      </Link>
      <Link
        href={`/search?mode=categories${q}`}
        className={cn(pill, mode === "categories" ? "bg-navy text-on-navy" : "bg-surface/80 text-ink ring-1 ring-ink/10")}
      >
        Categories
      </Link>
    </div>
  );
}
