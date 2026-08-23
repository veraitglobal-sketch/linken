/** Static footer link groups — no auth/DB. */

export type FooterGroup = {
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
};

/**
 * Four named columns, not one wrapping row.
 *
 * The nine primary links used to sit in a single `flex-wrap` row aligned right.
 * Measured at 1440 that broke 7 + 2, leaving "Contact" and "Sign in" stranded on
 * a second line — a wrap nobody chose, and the reason the block read as a pile
 * rather than a sitemap. They were also unsorted: what the product does, who
 * runs it, and an account action, all in one undifferentiated list.
 *
 * The six legal links come up here too. They were crammed into the bottom bar
 * beside the copyright, which left that bar carrying three unrelated jobs at
 * 12px. It now carries two: who owns this and how to reach them.
 *
 * `Use cases`, `Changelog` and `Status` are new here and not new pages: all
 * three already existed and all three return 200, they were simply missing
 * from the only sitemap the site publishes. A thin footer is usually a footer
 * that forgot pages, not one that needs invented ones — and inventing a link
 * to a page that does not exist is the one thing a footer must never do.
 */
export const FOOTER_GROUPS: ReadonlyArray<FooterGroup> = [
  {
    heading: "Product",
    links: [
      { label: "Search companies", href: "/search" },
      { label: "Pricing", href: "/pricing" },
      { label: "Use cases", href: "/use-cases" },
      { label: "Demo", href: "/demo" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
      /* Labelled as the page titles itself. Bare "Company" next to a column
         also called Company read as a duplicate of the heading. */
      { label: "Company information", href: "/company" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Developers", href: "/developers" },
      { label: "Changelog", href: "/changelog" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
      { label: "Data deletion", href: "/data-deletion" },
      { label: "Subprocessors", href: "/subprocessors" },
      { label: "Disclosure", href: "/disclosure" },
    ],
  },
] as const;
