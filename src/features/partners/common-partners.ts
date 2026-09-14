import { getViewerCompany } from "@/features/case-studies/viewer";
import { getPartnersForCompany } from "@/features/partners/public-queries";
import type { Partner } from "@/types/partner";

/** Confirmed partners that the viewer and this profile both accepted. */
export async function getCommonPartners(
  profileCompanyId: string,
  theirs: Partner[],
): Promise<Partner[]> {
  const { company: viewer } = await getViewerCompany();
  if (!viewer?.id || viewer.id === profileCompanyId) return [];

  const mine = await getPartnersForCompany(viewer.id);
  const theirsById = new Map(theirs.map((p) => [p.id, p]));
  return mine.filter((p) => theirsById.has(p.id)).slice(0, 8);
}
