/** Navigation + field tables aligned 1:1 with public-api/v1/types.ts */

export type NavItem = {
  id: string;
  label: string;
  children?: { id: string; label: string }[];
};

export const DOCS_NAV: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quickstart" },
  {
    id: "endpoints",
    label: "Public endpoints",
    children: [
      { id: "endpoint-company", label: "Company" },
      { id: "endpoint-references", label: "References" },
      { id: "endpoint-case-studies", label: "Case studies" },
      { id: "endpoint-verify", label: "Verify (oracle)" },
    ],
  },
  { id: "embeds", label: "Embeds" },
  { id: "llms", label: "llms.txt & llm.md" },
  {
    id: "agent-api",
    label: "Agent API",
    children: [
      { id: "agent-auth", label: "Auth & scopes" },
      { id: "agent-parity", label: "Owner → API map" },
      { id: "agent-setup", label: "Setup script" },
      { id: "agent-mcp", label: "Cursor MCP" },
      { id: "agent-endpoints", label: "Endpoints" },
      { id: "agent-cannot", label: "What agents cannot do" },
    ],
  },
  { id: "errors", label: "Errors" },
  { id: "versioning", label: "Versioning" },
];

/** External / legal links shown under docs nav Contents. */
export const DOCS_LINKS = [
  { href: "/api/v1/openapi", label: "OpenAPI" },
  { href: "/developers/webhooks", label: "Webhooks" },
  { href: "/developers/api-terms", label: "API Terms" },
  { href: "/changelog", label: "Changelog" },
  { href: "/status", label: "Status" },
  { href: "/security", label: "Security" },
] as const;

export type FieldRow = {
  name: string;
  type: string;
  description: string;
};

export const COMPANY_FIELDS: FieldRow[] = [
  { name: "slug", type: "string", description: "Public URL slug." },
  { name: "name", type: "string", description: "Company display name." },
  { name: "category", type: "string", description: "Primary category." },
  { name: "city", type: "string", description: "City." },
  { name: "country", type: "string", description: "Country." },
  { name: "website", type: "string", description: "Public website URL." },
  {
    name: "verified",
    type: "boolean",
    description: "Whether the profile carries a verified mark.",
  },
  {
    name: "claimed",
    type: "boolean",
    description: "False for unclaimed directory stubs.",
  },
  {
    name: "accepting_clients",
    type: "boolean",
    description: "Owner-set availability for new clients.",
  },
  {
    name: "trust_level",
    type: '"member" | "established" | "trusted" | "pillar"',
    description: "Public Hansala Level (lowercase).",
  },
  {
    name: "stats",
    type: "ApiCompanyStats | null",
    description: "Confirmed counts. Null when unclaimed.",
  },
  {
    name: "stats.confirmed_partners",
    type: "number",
    description: "Accepted mutual partnerships.",
  },
  {
    name: "stats.confirmed_references",
    type: "number",
    description: "Confirmed finished service references.",
  },
  {
    name: "stats.ongoing_references",
    type: "number",
    description: "Confirmed ongoing service references.",
  },
  {
    name: "stats.confirmed_case_studies",
    type: "number",
    description: "Case studies with client or partner confirmation.",
  },
  {
    name: "assessment",
    type: "ApiAssessment | null",
    description:
      "Null until would_work_again_total ≥ 3 (anonymity rule).",
  },
  {
    name: "assessment.would_work_again_yes",
    type: "number",
    description: "Clients who would work again.",
  },
  {
    name: "assessment.would_work_again_total",
    type: "number",
    description: "Total would-work-again answers.",
  },
  {
    name: "assessment.top_strengths",
    type: "ApiStrength[]",
    description: "Top strengths, highest count first.",
  },
  {
    name: "assessment.top_strengths[].key",
    type: "string",
    description: 'Catalog key, e.g. "reliability".',
  },
  {
    name: "assessment.top_strengths[].label",
    type: "string",
    description: "Human label.",
  },
  {
    name: "assessment.top_strengths[].count",
    type: "number",
    description: "How many assessments selected this strength.",
  },
  {
    name: "profile_url",
    type: "string",
    description: "Absolute URL to the public profile.",
  },
  {
    name: "generated_at",
    type: "string",
    description: "ISO-8601 generation timestamp.",
  },
];

export const REFERENCE_FIELDS: FieldRow[] = [
  { name: "references", type: "ApiReference[]", description: "Confirmed only, max 50. Ongoing first." },
  { name: "count", type: "number", description: "Length of references." },
  { name: "references[].client_name", type: "string", description: "Client display name." },
  {
    name: "references[].client_slug",
    type: "string | null",
    description: "Public slug when the client has a claimed Hansala profile.",
  },
  { name: "references[].service", type: "string", description: "Service described." },
  { name: "references[].started_year", type: "string", description: "Start year." },
  { name: "references[].ongoing", type: "boolean", description: "Still active engagement." },
  {
    name: "references[].ended_year",
    type: "string | null",
    description: "End year when finished.",
  },
  {
    name: "references[].confirmed_at",
    type: "string",
    description: "ISO-8601 when the client confirmed.",
  },
];

export const CASE_STUDY_FIELDS: FieldRow[] = [
  { name: "case_studies", type: "ApiCaseStudy[]", description: "Confirmed only, max 20." },
  { name: "count", type: "number", description: "Length of case_studies." },
  { name: "case_studies[].slug", type: "string", description: "Case study slug." },
  { name: "case_studies[].title", type: "string", description: "Title." },
  { name: "case_studies[].summary", type: "string", description: "Short summary." },
  { name: "case_studies[].year", type: "string", description: "Project year." },
  { name: "case_studies[].location", type: "string", description: "Location." },
  {
    name: "case_studies[].url",
    type: "string",
    description: "Absolute URL to the case study page.",
  },
  {
    name: "case_studies[].client_confirmed",
    type: "boolean",
    description: "Client confirmation present.",
  },
  {
    name: "case_studies[].confirmed_partners",
    type: "ApiCaseStudyPartner[]",
    description: "Partners who confirmed on this case.",
  },
  {
    name: "case_studies[].confirmed_partners[].name",
    type: "string",
    description: "Partner name.",
  },
  {
    name: "case_studies[].confirmed_partners[].slug",
    type: "string",
    description: "Partner public slug.",
  },
];

export const VERIFY_FIELDS: FieldRow[] = [
  {
    name: "found",
    type: "boolean",
    description: "Whether a claimed company matched the domain. false is still HTTP 200.",
  },
  {
    name: "company",
    type: "{ name, slug, profile_url } | null",
    description: "Matched firm when found.",
  },
  {
    name: "verified",
    type: "boolean",
    description: "Domain verification flag.",
  },
  {
    name: "verification_method",
    type: '"email_domain" | "dns_txt" | "meta_tag" | null',
    description: "How the domain was verified; null if not verified.",
  },
  {
    name: "verified_since",
    type: "string | null",
    description: "ISO-8601 timestamp of domain verification.",
  },
  {
    name: "trust_level",
    type: "ApiTrustLevel | null",
    description: "Public trust level from confirmed evidence only.",
  },
  {
    name: "stats",
    type: "ApiCompanyStats | null",
    description: "Confirmed counts; null when not found.",
  },
  {
    name: "assessment",
    type: "ApiAssessment | null",
    description: "Null until ≥3 client assessment answers.",
  },
  {
    name: "llm_md_url",
    type: "string | null",
    description: "Markdown snapshot URL for LLMs.",
  },
  {
    name: "api_url",
    type: "string | null",
    description: "Canonical Public API company URL.",
  },
];

export const ERROR_FIELDS: FieldRow[] = [
  {
    name: "error.code",
    type: '"not_found" | "invalid_request" | "unauthorized" | "invalid_key" | "insufficient_scope" | "plan_required" | "rate_limited" | "service_unavailable" | "internal"',
    description: "Machine-readable code. plan_required = Agent API needs Pro.",
  },
  { name: "error.message", type: "string", description: "Human-readable message." },
];
