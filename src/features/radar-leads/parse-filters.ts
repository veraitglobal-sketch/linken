import type { TrustLevel } from "@/features/trust/score";

export function parseRadarFilters(sp: {
  category?: string;
  country?: string;
  city?: string;
  level?: string;
  accepting?: string;
}) {
  const filters = {
    category: sp.category?.trim() ?? "",
    country: sp.country?.trim() ?? "",
    city: sp.city?.trim() ?? "",
    level: sp.level?.trim() ?? "",
    accepting: sp.accepting?.trim() ?? "",
  };
  const acceptingClients =
    filters.accepting === "1"
      ? true
      : filters.accepting === "0"
        ? false
        : null;

  return {
    filters,
    acceptingClients,
    trustLevel: (filters.level as TrustLevel) || "",
  };
}
