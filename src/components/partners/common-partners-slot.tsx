import { CommonPartnersNote } from "@/components/partners/common-partners-note";
import { getCommonPartners } from "@/features/partners/common-partners";
import type { Partner } from "@/types/partner";

export async function CommonPartnersSlot({
  companyId,
  theirs,
}: {
  companyId: string;
  theirs: Partner[];
}) {
  const partners = await getCommonPartners(companyId, theirs);
  return <CommonPartnersNote partners={partners} />;
}
