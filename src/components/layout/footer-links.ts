/** Static footer link groups — no auth/DB. */

/** Primary navigation — one wrapping row, not four directories. */
export const FOOTER_PRIMARY = [
  { label: "Search companies", href: "/search" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Developers", href: "/developers" },
  { label: "Demo", href: "/demo" },
  { label: "Company", href: "/company" },
  { label: "Security", href: "/security" },
  { label: "Contact", href: "/contact" },
  { label: "Sign in", href: "/login" },
] as const;

/** Legal line — required pages stay reachable. */
export const FOOTER_LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Data deletion", href: "/data-deletion" },
  { label: "Subprocessors", href: "/subprocessors" },
  { label: "Disclosure", href: "/disclosure" },
] as const;
