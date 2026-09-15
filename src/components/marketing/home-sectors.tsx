import { HomeBand, HomeTitle } from "@/components/marketing/home-section";

/** The firms Hansala is built for — the hero's "AEC, specialist contractors,
 *  agencies and consulting", spelled out. */
const SECTORS = [
  "Architecture",
  "Engineering",
  "Construction",
  "Specialist contractors",
  "Subcontractors",
  "Agencies",
  "Consultancies",
  "Studios",
] as const;

/** Homepage §3 — sector pills, five then three, centred. */
export function HomeSectors() {
  return (
    <HomeBand>
      <div className="mx-auto max-w-[1280px] text-center">
        <HomeTitle>Built for firms whose work is delivered together</HomeTitle>
        <ul className="mx-auto mt-12 flex max-w-[1250px] list-none flex-wrap justify-center gap-4 p-0 sm:gap-5">
          {SECTORS.map((s) => (
            <li
              key={s}
              className="inline-flex h-14 min-w-[160px] items-center justify-center rounded-full bg-white px-8 text-[16px] font-semibold text-ink sm:h-16 sm:min-w-[230px] sm:text-[18px]"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </HomeBand>
  );
}
