import { getSiteUrl } from "@/lib/site";
import { companyWithPath } from "@/features/seo/paths";
import type { PartnershipRow } from "@/features/partners/inbox";
import { csvLine } from "@/features/export/csv";

const HEADER = "id,name,slug,verified,confirmed_at,record_url";

/** Confirmed partners only — same fields as the public API, plus the record URL. */
export function buildConfirmedPartnersCsv(
  ownerSlug: string,
  rows: PartnershipRow[],
): string {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const lines = [HEADER];
  for (const row of rows) {
    if (row.status !== "accepted" || !row.id) continue;
    lines.push(
      csvLine([
        row.id,
        row.other.name,
        row.other.slug,
        row.other.verified ? "true" : "false",
        row.createdAt ?? "",
        `${siteUrl}${companyWithPath(ownerSlug, row.other.slug)}`,
      ]),
    );
  }
  return lines.length > 1 ? `${lines.join("\n")}\n` : "";
}
