import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Product and API changes for Hansala.",
};

const ENTRIES = [
  {
    date: "18 September 2026",
    items: [
      "Public API: stable relation UUIDs and confirmed_at on partners and references, for external evidence binding.",
      "Crawlable company directory (/companies) and ProfilePage JSON-LD with the company name as mainEntity.",
      "Email signature HTML (Widgets), CSV export of confirmed partners and references, /developers/evidence, hosted MCP discovery (/.well-known/mcp, /server-card).",
      "Public URLs on www (sitemap/robots), directory by letter, llms-full.txt, llm.md in the sitemap, IndexNow on confirmed pair records.",
    ],
  },
  {
    date: "26 July 2026",
    items: [
      "Outbound webhooks: HMAC-signed POSTs, dashboard + Agent API (`webhooks:manage`).",
      "security.txt (RFC 9116) + /api/health liveness.",
      "Public + Agent OpenAPI specs under /api/v1/openapi/*.",
      "Developer portal baseline: Privacy, Terms, API Terms, Security, Status.",
      "Scheduling: Calendly / Cal.com book sheet on company profiles; Agent `/scheduling`.",
      "Partnership claim flow: confirm-first gate (magic link or password continue).",
    ],
  },
  {
    date: "July 2026",
    items: [
      "Public API v1: companies, references, case studies, verify oracle.",
      "Agent API + MCP for Cursor / Claude (`hs_` keys).",
      "Embeds and llms.txt / per-company llm.md.",
    ],
  },
] as const;

export default function ChangelogPage() {
  return (
    <LegalDoc eyebrow="Developers" title="Changelog" updated="18 September 2026">
      <p>
        Notable product and API changes. Breaking API changes will ship under a
        new version path. See also{" "}
        <Link href="/developers">docs</Link> and{" "}
        <Link href="/status">status</Link>.
      </p>

      {ENTRIES.map((entry) => (
        <section key={entry.date}>
          <h2>{entry.date}</h2>
          <ul>
            {entry.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </LegalDoc>
  );
}
