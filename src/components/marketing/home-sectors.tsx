import Link from "next/link";
import { HomeBand, HomeTitle } from "@/components/marketing/home-section";
import { categoryBySlug } from "@/features/categories/taxonomy";

/** Homepage sector pills — names from the ranking taxonomy, not invented. */
const SECTOR_SLUGS = [
  "architecture",
  "interior-design",
  "engineering",
  "civil-engineering",
  "construction",
  "general-contracting",
  "specialist-contractors",
  "electrical-contractors",
  "facility-management",
  "software-development",
  "it-services",
  "web-development",
  "cybersecurity",
  "cloud-services",
  "digital-agencies",
  "design-studios",
  "consulting",
  "legal",
  "accounting",
  "recruitment",
  "real-estate",
  "property-development",
  "logistics",
  "manufacturing",
  "telecommunications",
  "energy",
  "healthcare",
  "events",
] as const;

const SECTORS = SECTOR_SLUGS.map((slug) => categoryBySlug(slug)).filter(
  (c): c is NonNullable<typeof c> => c != null,
);

/** Homepage §3 — sector pills, from the same categories the registry uses. */
export function HomeSectors() {
  return (
    <HomeBand>
      <div className="mx-auto max-w-[1280px] text-center">
        <HomeTitle>Built for firms whose work is delivered together</HomeTitle>
        <ul className="mx-auto mt-12 flex max-w-[1250px] list-none flex-wrap justify-center gap-3 p-0 sm:gap-4">
          {SECTORS.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/best/${s.slug}`}
                className="inline-flex h-12 min-w-[148px] items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-ink no-underline transition-colors hover:bg-lime-soft sm:h-14 sm:min-w-[180px] sm:px-7 sm:text-[16px]"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HomeBand>
  );
}
