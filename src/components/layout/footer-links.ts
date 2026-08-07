/** Static footer link groups — no auth/DB. */

export const FOOTER_PRODUCT = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Use cases", href: "/use-cases" },
  { label: "Developers", href: "/developers" },
  { label: "Changelog", href: "/changelog" },
  { label: "Status", href: "/status" },
  { label: "Demo", href: "/demo" },
] as const;

export const FOOTER_TRUST = [
  { label: "Company", href: "/company" },
  { label: "Security", href: "/security" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
  { label: "Data deletion", href: "/data-deletion" },
  { label: "Subprocessors", href: "/subprocessors" },
  { label: "Disclosure", href: "/disclosure" },
] as const;

export const FOOTER_DEVELOPERS = [
  { label: "API docs", href: "/developers" },
  { label: "OpenAPI", href: "/api/v1/openapi" },
  { label: "Webhooks", href: "/developers/webhooks" },
  { label: "API Terms", href: "/developers/api-terms" },
] as const;

export const FOOTER_ACCOUNT = [
  { label: "Sign in", href: "/login" },
  { label: "Create company", href: "/onboarding" },
  { label: "Cookies", href: "/cookies" },
] as const;
