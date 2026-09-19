/** "Client" is a relationship role on the other company's file — never a sector. */
const ROLE_SECTOR = /^client$/i;
const ROLE_TAGLINE = /^client of\s/i;
const GHOST_REFERENCE_DESCRIPTION =
  /^Draft profile created from a service reference by /;

export function asCompanySector(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value || ROLE_SECTOR.test(value)) return "";
  return value;
}

export function asPublicCompanyText(
  kind: "tagline" | "description",
  raw: string | null | undefined,
): string {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (kind === "tagline" && ROLE_TAGLINE.test(value)) return "";
  if (kind === "description" && GHOST_REFERENCE_DESCRIPTION.test(value)) {
    return "";
  }
  return value;
}
