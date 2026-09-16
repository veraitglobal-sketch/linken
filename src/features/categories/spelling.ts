/** SR/DE/EN tokens users type that should fold to English search forms. */
export const CATEGORY_TOKEN_SPELLING: Record<string, string> = {
  centar: "center",
  centre: "center",
  softver: "software",
  softveri: "software",
  ciscenje: "cleaning",
  gradevina: "construction",
  graevina: "construction",
  arhitektura: "architecture",
  inzenjering: "engineering",
  nekretnine: "real estate",
  osiguranje: "insurance",
  racunovodstvo: "accounting",
  advokat: "legal",
  kontakt: "contact",
};

export function applyCategorySpelling(normalized: string) {
  return normalized
    .split(" ")
    .map((t) => CATEGORY_TOKEN_SPELLING[t] ?? t)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
