import type { ProductEventName } from "@/features/product-analytics/taxonomy";

/**
 * Allowlisted property keys per event.
 * Never include emails, names, tokens, or relationship payloads.
 */
export type AnalyticsProps = {
  page?: string;
  source?: string;
  plan?: "free" | "pro" | "founding";
  previous_plan?: "free" | "pro" | "founding";
  cta?: string;
  surface?: "web" | "embed" | "api" | "email" | "webhook";
  variant?: string;
  host_bucket?: "own" | "other" | "unknown";
  invite_kind?: "reference" | "partnership" | "case_study" | "claim";
  days_since_company_created?: number;
  is_first?: boolean;
};

export type TrackInput = {
  name: ProductEventName;
  companyId?: string | null;
  props?: AnalyticsProps;
};

/** Keys never accepted on any event. */
export const FORBIDDEN_PROP_KEYS = [
  "email",
  "invite_email",
  "author_email",
  "name",
  "client_name",
  "token",
  "claim_token",
  "password",
  "body",
  "quote",
] as const;

export const ALLOWED_PROP_KEYS = [
  "page",
  "source",
  "plan",
  "previous_plan",
  "cta",
  "surface",
  "variant",
  "host_bucket",
  "invite_kind",
  "days_since_company_created",
  "is_first",
] as const;
