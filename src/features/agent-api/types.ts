/**
 * Hansala Agent API v1 — authenticated contract for AI agents / integrations.
 * Fields may be ADDED. Never rename/remove. Confirm endpoints do not exist.
 */

export const AGENT_SCOPES = [
  "read",
  "content:write",
  "invites:send",
  "team:manage",
  "structure:manage",
  "settings:write",
  "inquiries:manage",
  "verification:run",
  "webhooks:manage",
] as const;
export type AgentScope = (typeof AGENT_SCOPES)[number];

export const AGENT_SCOPE_PRESETS = {
  read_only: ["read"] as AgentScope[],
  content_manager: ["read", "content:write", "invites:send"] as AgentScope[],
  full_access: [...AGENT_SCOPES] as AgentScope[],
};

export type AgentErrorCode =
  | "unauthorized"
  | "invalid_key"
  | "insufficient_scope"
  | "plan_required"
  | "not_found"
  | "invalid_request"
  | "rate_limited"
  | "service_unavailable"
  | "internal";

export type AgentErrorBody = {
  error: {
    code: AgentErrorCode;
    message: string;
  };
};

export type AgentAuthContext = {
  companyId: string;
  keyId: string;
  scopes: AgentScope[];
};

export type AgentCompanyResponse = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  city: string;
  country: string;
  website: string;
  logo_url: string | null;
  cover_image_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  services: string[];
  verified: boolean;
  verified_at: string | null;
  website_linked: boolean;
  accepting_clients: boolean;
  claimed: boolean;
  trust: {
    level: string;
    points: number;
    breakdown: Record<string, number>;
  };
  verification: {
    verified: boolean;
    verified_at: string | null;
    website_linked: boolean;
  };
};

export type AgentReference = {
  id: string;
  client_name: string;
  client_company_id: string | null;
  service: string;
  started_year: string;
  ongoing: boolean;
  ended_year: string | null;
  status: "pending" | "confirmed" | "declined";
  created_at: string;
  confirmed_at: string | null;
  confirmation_level: 1 | 2 | 3 | null;
  disclosure: "named" | "undisclosed" | null;
};

export type AgentCaseStudy = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  challenge: string;
  outcome: string;
  process: string;
  location: string;
  year: string;
  duration: string;
  sector: string;
  scope: string;
  client_label: string;
  highlight_stat: string;
  client_quote: string;
  metrics: { label: string; value: string }[];
  services: string[];
  cover_image_url: string | null;
  gallery_urls: string[];
  created_at: string;
  public_url?: string;
};

export type AgentPartnership = {
  id: string;
  status: string;
  role: "requester" | "recipient";
  other_company: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
};

export type AgentInquiry = {
  id: string;
  sender_name: string;
  sender_email: string;
  /** mailto: for off-platform reply — inquiry was sent to this company. */
  mailto: string;
  sender_company: string;
  message: string;
  service_interest: string;
  status: string;
  created_at: string;
};

export type AgentAuditRow = {
  id: number;
  method: string;
  path: string;
  action: string;
  status: number;
  summary: string;
  created_at: string;
};

export type AgentApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: AgentScope[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};
