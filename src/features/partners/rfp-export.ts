import { getSiteUrl } from "@/lib/site";
import { rfpPartnerBlock } from "@/features/certificate/copy";
import { formatCertificateDate } from "@/features/certificate/format";
import { companyWithPath } from "@/features/seo/paths";
import type { PartnershipRow } from "@/features/partners/inbox";

export function buildRfpPartnerText(
  ownerName: string,
  ownerSlug: string,
  rows: PartnershipRow[],
): string {
  const siteUrl = getSiteUrl();
  return rfpPartnerBlock(
    ownerName,
    rows.map((row) => ({
      name: row.other.name,
      category: row.other.category,
      city: row.other.city,
      since: row.createdAt ? formatCertificateDate(row.createdAt) : "",
      recordUrl: `${siteUrl}${companyWithPath(ownerSlug, row.other.slug)}`,
    })),
  );
}
