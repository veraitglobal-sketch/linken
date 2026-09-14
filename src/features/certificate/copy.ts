import { formatCertificateDate } from "@/features/certificate/format";

export function partnershipAnnouncement(
  leftName: string,
  rightName: string,
  iso: string,
): string {
  return `${formatCertificateDate(iso)}, ${leftName} and ${rightName} confirmed on Hansala that they work together. Both companies accepted.`;
}

export function logoUseStatement(
  leftName: string,
  rightName: string,
  iso: string,
): string {
  return `${leftName} and ${rightName} confirmed this relationship on ${formatCertificateDate(iso)}. Marks on this record belong to the companies that confirmed.`;
}

export function rfpPartnerBlock(
  ownerName: string,
  rows: { name: string; category: string; city: string; recordUrl: string; since: string }[],
): string {
  const lines = [
    `Confirmed partners for ${ownerName} on Hansala`,
    "",
    ...rows.map((r) => {
      const meta = [r.category, r.city, r.since ? `since ${r.since}` : ""]
        .filter(Boolean)
        .join(" · ");
      return `- ${r.name}${meta ? ` (${meta})` : ""} — ${r.recordUrl}`;
    }),
  ];
  return lines.join("\n");
}
