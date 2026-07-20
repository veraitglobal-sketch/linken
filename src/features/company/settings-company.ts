export type SettingsCompany = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  city: string;
  country: string;
  website: string;
  linkedinUrl: string;
  facebookUrl: string;
  services: string[];
  acceptingClients: boolean;
  verified: boolean;
  publicHost: string;
};

type Row = {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  services: string[] | null;
  accepting_clients: boolean | null;
  verified: boolean | null;
};

export function toSettingsCompany(row: Row, publicHost: string): SettingsCompany {
  return {
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    category: row.category ?? "",
    city: row.city ?? "",
    country: row.country ?? "Germany",
    website: row.website ?? "",
    linkedinUrl: row.linkedin_url ?? "",
    facebookUrl: row.facebook_url ?? "",
    services: row.services ?? [],
    acceptingClients: row.accepting_clients !== false,
    verified: Boolean(row.verified),
    publicHost,
  };
}
