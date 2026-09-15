import { matchCategory } from "@/features/categories/match";
import { matchCountry } from "@/features/geo/countries";

export type CategoryWrite = {
  category: string;
  category_slug: string | null;
  unmatched: boolean;
};

export type CountryWrite = {
  country: string;
  country_code: string | null;
};

/** Hidden slug is ignored — matchCategory is the authority. */
export function resolveCategoryWrite(raw: string): CategoryWrite {
  const category = raw.trim().slice(0, 80);
  if (!category) return { category: "", category_slug: null, unmatched: false };
  const matched = matchCategory(category);
  return {
    category,
    category_slug: matched?.slug ?? null,
    unmatched: !matched,
  };
}

export function resolveCountryWrite(codeRaw: string, nameRaw: string): CountryWrite {
  const fromCode = matchCountry(codeRaw);
  const fromName = matchCountry(nameRaw);
  const hit = fromCode ?? fromName;
  if (hit) return { country: hit.name, country_code: hit.code };
  const country = nameRaw.trim().slice(0, 80);
  return { country, country_code: null };
}
