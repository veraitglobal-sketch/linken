/**
 * Synthetic fixtures for Hansala tests.
 * Never use real people, companies, or production emails.
 */

export const FIXTURES = {
  provider: {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "northline-studio-test",
    name: "Northline Studio (Test)",
    website: "https://northline.test",
    email: "ops@northline.test",
  },
  client: {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "harbor-works-test",
    name: "Harbor Works (Test)",
    website: "https://harbor.test",
    email: "confirm@harbor.test",
  },
  tokens: {
    claim: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    confirmReference: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    confirmCase: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  },
  billing: {
    customerId: "cus_test_northline",
    subscriptionId: "sub_test_northline",
  },
};

/** Public API company response must include these keys (contract). */
export const API_COMPANY_REQUIRED_KEYS = [
  "slug",
  "name",
  "category",
  "city",
  "country",
  "website",
  "verified",
  "claimed",
  "accepting_clients",
  "trust_level",
  "stats",
  "assessment",
  "profile_url",
  "generated_at",
];

/** Keys that must never appear on public API / public profile payloads. */
export const PUBLIC_FORBIDDEN_KEYS = [
  "claim_token",
  "confirm_token",
  "invite_email",
  "owner_id",
  "referred_by_company_id",
  "stripe_customer_id",
  "stripe_subscription_id",
];
