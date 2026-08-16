/** Organization form — separate from sector (`category`). */

export const ORGANIZATION_KINDS = [
  "company",
  "nonprofit",
  "association",
  "public_body",
  "political_party",
  "cooperative",
  "other",
] as const;

export type OrganizationKind = (typeof ORGANIZATION_KINDS)[number];

export const ORGANIZATION_KIND_META: {
  id: OrganizationKind;
  label: string;
  categoryHint: string;
}[] = [
  { id: "company", label: "Company", categoryHint: "Architecture, software…" },
  { id: "nonprofit", label: "Nonprofit", categoryHint: "Health, education, advocacy…" },
  {
    id: "association",
    label: "Association / NGO",
    categoryHint: "Industry body, chamber…",
  },
  {
    id: "public_body",
    label: "Public body",
    categoryHint: "Municipality, agency…",
  },
  {
    id: "political_party",
    label: "Political party",
    categoryHint: "Party, campaign org…",
  },
  {
    id: "cooperative",
    label: "Cooperative",
    categoryHint: "Housing, energy, retail…",
  },
  { id: "other", label: "Other organization", categoryHint: "Your sector…" },
];

export function parseOrganizationKind(raw: string): OrganizationKind | null {
  const v = raw.trim();
  return (ORGANIZATION_KINDS as readonly string[]).includes(v)
    ? (v as OrganizationKind)
    : null;
}

export function organizationKindLabel(kind: string | null | undefined): string {
  const found = ORGANIZATION_KIND_META.find((k) => k.id === kind);
  return found?.label ?? "Organization";
}
