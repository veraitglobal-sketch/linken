import { extractDomain } from "@/features/verification/domain";

/** Rejected even if present in FormData — defense in depth beyond UI. */
export const SETTINGS_FORBIDDEN_FIELDS = [
  "slug",
  "verified",
  "plan",
  "claimed",
  "owner_id",
  "id",
] as const;

export function hasForbiddenSettingsFields(formData: FormData): string | null {
  for (const key of SETTINGS_FORBIDDEN_FIELDS) {
    if (formData.has(key)) return key;
  }
  return null;
}

export function normalizeSocialUrl(
  raw: string,
  hostIncludes: string[],
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (!hostIncludes.some((h) => host === h || host.endsWith(`.${h}`))) {
    return null;
  }
  return url.toString();
}

export function parseServices(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
}

/** True when normalized hostname differs (path/www-only changes return false). */
export function websiteDomainChanged(prev: string, next: string): boolean {
  return extractDomain(prev) !== extractDomain(next);
}

export type ParsedProfile = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  city: string;
  country: string;
  website: string;
  linkedin_url: string | null;
  facebook_url: string | null;
  services: string[];
  accepting_clients: boolean;
};

export function parseSettingsFormData(
  formData: FormData,
): { ok: true; data: ParsedProfile } | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 120) {
    return { ok: false, error: "Company name is required (max 120 characters)." };
  }

  const website = String(formData.get("website") ?? "").trim();
  if (website && !extractDomain(website)) {
    return { ok: false, error: "Website must be a valid domain or URL." };
  }

  const linkedinRaw = String(formData.get("linkedin_url") ?? "");
  const facebookRaw = String(formData.get("facebook_url") ?? "");
  const linkedin =
    linkedinRaw.trim() === ""
      ? null
      : normalizeSocialUrl(linkedinRaw, ["linkedin.com"]);
  const facebook =
    facebookRaw.trim() === ""
      ? null
      : normalizeSocialUrl(facebookRaw, ["facebook.com", "fb.com"]);

  if (linkedinRaw.trim() && !linkedin) {
    return { ok: false, error: "LinkedIn URL must be a linkedin.com link." };
  }
  if (facebookRaw.trim() && !facebook) {
    return { ok: false, error: "Facebook URL must be a facebook.com link." };
  }

  return {
    ok: true,
    data: {
      name,
      tagline: String(formData.get("tagline") ?? "").trim().slice(0, 160),
      description: String(formData.get("description") ?? "").trim().slice(0, 4000),
      category: String(formData.get("category") ?? "").trim().slice(0, 80),
      city: String(formData.get("city") ?? "").trim().slice(0, 80),
      country: String(formData.get("country") ?? "").trim().slice(0, 80) || "Germany",
      website,
      linkedin_url: linkedin,
      facebook_url: facebook,
      services: parseServices(String(formData.get("services") ?? "")),
      accepting_clients: String(formData.get("accepting_clients") ?? "") === "true",
    },
  };
}
