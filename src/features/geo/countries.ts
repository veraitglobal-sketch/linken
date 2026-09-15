export type IsoCountry = { code: string; name: string };

/** ISO 3166-1 alpha-2 — Europe first, then the rest we actually see. */
export const ISO_COUNTRIES: IsoCountry[] = [
  { code: "DE", name: "Germany" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "RS", name: "Serbia" },
  { code: "HR", name: "Croatia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "ME", name: "Montenegro" },
  { code: "SI", name: "Slovenia" },
  { code: "MK", name: "North Macedonia" },
  { code: "AL", name: "Albania" },
  { code: "XK", name: "Kosovo" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "BG", name: "Bulgaria" },
  { code: "GR", name: "Greece" },
  { code: "IT", name: "Italy" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "LU", name: "Luxembourg" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czechia" },
  { code: "SK", name: "Slovakia" },
  { code: "DK", name: "Denmark" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "GB", name: "United Kingdom" },
  { code: "UA", name: "Ukraine" },
  { code: "TR", name: "Türkiye" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "IL", name: "Israel" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "EE", name: "Estonia" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "IS", name: "Iceland" },
  { code: "MT", name: "Malta" },
  { code: "CY", name: "Cyprus" },
];

const ALIASES: Record<string, string> = {
  deutschland: "DE",
  germany: "DE",
  de: "DE",
  osterreich: "AT",
  austria: "AT",
  schweiz: "CH",
  switzerland: "CH",
  suisse: "CH",
  serbia: "RS",
  srbija: "RS",
  rs: "RS",
  croatia: "HR",
  hrvatska: "HR",
  bosnia: "BA",
  "bosnia and herzegovina": "BA",
  bih: "BA",
  montenegro: "ME",
  crna: "ME",
  slovenia: "SI",
  slovenija: "SI",
  "united kingdom": "GB",
  uk: "GB",
  britain: "GB",
  england: "GB",
  "united states": "US",
  usa: "US",
  "u.s.": "US",
  "u.s.a.": "US",
  turkiye: "TR",
  turkey: "TR",
  czechia: "CZ",
  "czech republic": "CZ",
  netherlands: "NL",
  holland: "NL",
};

function fold(text: string) {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function countryByCode(code: string | null | undefined): IsoCountry | null {
  const c = (code ?? "").trim().toUpperCase();
  if (!c) return null;
  return ISO_COUNTRIES.find((row) => row.code === c) ?? null;
}

/** Map a typed country or ISO code to alpha-2. Never invents a country. */
export function matchCountry(text: string): IsoCountry | null {
  const raw = text.trim();
  if (!raw) return null;
  if (/^[A-Za-z]{2}$/.test(raw)) return countryByCode(raw);
  const key = fold(raw);
  const aliased = ALIASES[key];
  if (aliased) return countryByCode(aliased);
  return (
    ISO_COUNTRIES.find((row) => fold(row.name) === key) ??
    ISO_COUNTRIES.find((row) => fold(row.name).startsWith(key) && key.length >= 4) ??
    null
  );
}
