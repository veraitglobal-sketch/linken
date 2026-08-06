import type { Metadata } from "next";
import Link from "next/link";
import { CompanyFacts } from "@/components/legal/company-facts";
import { LegalDoc } from "@/components/legal/legal-doc";
import { PlaceholderNotice } from "@/components/legal/placeholder-notice";
import { getLegalCompany } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "Company information",
  description:
    "Legal company name, registered address, and contact for Hansala.",
};

export default function CompanyPage() {
  const company = getLegalCompany();

  return (
    <LegalDoc
      eyebrow="Trust"
      title="Company information"
      updated="6 August 2026"
      currentPath="/company"
    >
      <PlaceholderNotice />
      <p>
        Hansala is operated by {company.entityName ?? "the legal entity below"}{" "}
        — the same firm as{" "}
        <a
          href="https://verait.de/legal/impressum"
          rel="noopener noreferrer"
          target="_blank"
        >
          Vera IT
        </a>
        . Brand contact for Hansala is {company.contactEmail}.
      </p>

      <h2>Legal entity</h2>
      <CompanyFacts />

      <h2>More</h2>
      <p>
        <Link href="/about">About</Link> · <Link href="/contact">Contact</Link>{" "}
        · <Link href="/privacy">Privacy</Link>
      </p>
    </LegalDoc>
  );
}
