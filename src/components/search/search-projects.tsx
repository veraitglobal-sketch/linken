import { CaseCubes } from "@/components/search/case-cubes";
import type { ConfirmedCaseCard } from "@/features/case-studies/queries-public";

/**
 * Confirmed projects as cubes, left to right.
 *
 * Absence is not shown. A visitor never sees an empty slot that would imply
 * the directory is new — the row exists only when a client has confirmed work.
 */
export function SearchProjects({
  cases,
  heading,
}: {
  cases: ConfirmedCaseCard[];
  heading: string;
}) {
  if (cases.length === 0) return null;
  return <CaseCubes cases={cases} heading={heading} />;
}
