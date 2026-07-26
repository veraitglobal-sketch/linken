import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Product and API changes for Hansala.",
};

const ENTRIES = [
  {
    date: "26 July 2026",
    items: [
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
    <LegalDoc eyebrow="Developers" title="Changelog" updated="26 July 2026">
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
