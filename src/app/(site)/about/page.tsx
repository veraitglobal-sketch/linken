import type { Metadata } from "next";
import Link from "next/link";
import { CompanyFacts } from "@/components/legal/company-facts";
import { LegalDoc } from "@/components/legal/legal-doc";
import { PlaceholderNotice } from "@/components/legal/placeholder-notice";
import { MISSION, PRINCIPLES } from "@/features/legal/principles";
import { getLegalCompany } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "About Hansala",
  description:
    "What Hansala is: mutually confirmed business relationships, product principles, and company identity.",
};

export default function AboutPage() {
  const company = getLegalCompany();

  return (
    <LegalDoc
      eyebrow="Trust"
      title="About Hansala"
      updated="6 August 2026"
      currentPath="/about"
    >
      <PlaceholderNotice />

      <h2>Mission</h2>
      <p>{MISSION}</p>
      <p>
        Hansala is built and operated by {company.entityName}, Hamburg — the same
        company as{" "}
        <a
          href="https://verait.de"
          rel="noopener noreferrer"
          target="_blank"
        >
          verait.de
        </a>
        . Product contact:{" "}
        <a href={`mailto:${company.contactEmail}`}>{company.contactEmail}</a>.
      </p>

      <h2>Product principles</h2>
      <ul>
        {PRINCIPLES.map((p) => (
          <li key={p.title}>
            <strong>{p.title}.</strong> {p.body}
          </li>
        ))}
      </ul>

      {company.founderName ? (
        <>
          <h2>Team</h2>
          <p>
            <strong>{company.founderName}</strong>
            {company.founderRole ? ` — ${company.founderRole}` : null}
          </p>
        </>
      ) : (
        <>
          <h2>Team</h2>
          <p className="text-ink-soft">
            Founder or team details are not published yet. Set{" "}
            <code className="text-[13px]">NEXT_PUBLIC_LEGAL_FOUNDER_NAME</code>{" "}
            (and optionally{" "}
            <code className="text-[13px]">NEXT_PUBLIC_LEGAL_FOUNDER_ROLE</code>)
            when ready — we do not invent names.
          </p>
        </>
      )}

      <h2>Company information</h2>
      <p>
        Legal entity details live on the{" "}
        <Link href="/company">company information</Link> page. Summary:
      </p>
      <CompanyFacts />
    </LegalDoc>
  );
}
