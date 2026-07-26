import type { EmbedProofCompany } from "@/components/embed/embed-brand";

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Studio-only filler so the slide is visible before real partners exist. */
export const PREVIEW_PROOF_COMPANIES: EmbedProofCompany[] = [
  { name: "Nordic Steel", initials: "NS", website: "https://example.com" },
  { name: "Harbor Labs", initials: "HL", website: "https://example.org" },
  { name: "Cascade Digits", initials: "CD" },
  { name: "Vera Transit", initials: "VT" },
  { name: "Oak & Pine", initials: "OP" },
  { name: "Brightline Co", initials: "BC" },
];

/** Merge wall + reference clients into one logo strip (deduped by name). */
export function buildProofCompanies(input: {
  wall: Array<{
    name: string;
    initials: string;
    logoUrl?: string | null;
    website?: string | null;
  }>;
  references: Array<{
    clientName: string;
    clientLogoUrl?: string | null;
    clientWebsite?: string | null;
    disclosure?: "named" | "undisclosed" | null;
  }>;
  limit?: number;
}): EmbedProofCompany[] {
  const limit = input.limit ?? 24;
  const seen = new Set<string>();
  const out: EmbedProofCompany[] = [];

  for (const e of input.wall) {
    const key = e.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      name: e.name,
      initials: e.initials || initialsFrom(e.name),
      logoUrl: e.logoUrl,
      website: e.website,
    });
    if (out.length >= limit) return out;
  }

  for (const r of input.references) {
    if (r.disclosure === "undisclosed") continue;
    const key = r.clientName.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      name: r.clientName,
      initials: initialsFrom(r.clientName),
      logoUrl: r.clientLogoUrl,
      website: r.clientWebsite,
    });
    if (out.length >= limit) return out;
  }

  return out;
}
