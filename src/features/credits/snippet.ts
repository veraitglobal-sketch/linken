import { extractDomain } from "@/features/verification/domain";

export type CreditTarget = {
  slug: string;
  name: string;
  website: string;
};

export function absoluteWebsite(website: string): string | null {
  const domain = extractDomain(website);
  if (!domain) return null;
  const raw = website.trim();
  try {
    if (raw.includes("://")) {
      const url = new URL(raw);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      url.protocol = "https:";
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return null;
  }
  return `https://${domain}`;
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function partnerCreditSnippet(partner: CreditTarget): string | null {
  const href = absoluteWebsite(partner.website);
  const slug = partner.slug.trim().toLowerCase();
  if (!href || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const name = escapeAttr(partner.name.trim() || slug);
  return `<a href="${escapeAttr(href)}" data-hansala-credit="${slug}" rel="noopener">${name}</a>`;
}

export function partnersCreditSnippet(partners: CreditTarget[]): string {
  return partners
    .map(partnerCreditSnippet)
    .filter((row): row is string => Boolean(row))
    .join("\n");
}
