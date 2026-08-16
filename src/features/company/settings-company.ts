export type SettingsCompany = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  organizationKind: string;
  category: string;
  city: string;
  country: string;
  website: string;
  linkedinUrl: string;
  facebookUrl: string;
  services: string[];
  acceptingClients: boolean;
  verified: boolean;
  inviteRemindersEnabled: boolean;
  publicHost: string;
};

type Row = {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  organization_kind?: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  services: unknown;
  accepting_clients: boolean | null;
  verified: boolean | null;
  invite_reminders_enabled?: boolean | null;
};

function asServices(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((s) => String(s ?? "").trim())
      .filter(Boolean)
      .slice(0, 40);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
  }
  return [];
}

export function toSettingsCompany(row: Row, publicHost: string): SettingsCompany {
  return {
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    organizationKind: row.organization_kind ?? "company",
    category: row.category ?? "",
    city: row.city ?? "",
    country: row.country ?? "Germany",
    website: row.website ?? "",
    linkedinUrl: row.linkedin_url ?? "",
    facebookUrl: row.facebook_url ?? "",
    services: asServices(row.services),
    acceptingClients: row.accepting_clients !== false,
    verified: Boolean(row.verified),
    inviteRemindersEnabled: row.invite_reminders_enabled !== false,
    publicHost,
  };
}
