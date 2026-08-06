import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";
import { PlaceholderNotice } from "@/components/legal/placeholder-notice";
import { getLegalCompany } from "@/lib/legal/company";
import { mailto } from "@/lib/legal/emails";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Hansala for product, privacy, and security.",
};

export default function ContactPage() {
  const c = getLegalCompany();

  return (
    <LegalDoc
      eyebrow="Trust"
      title="Contact"
      updated="6 August 2026"
      currentPath="/contact"
    >
      <PlaceholderNotice />
      <p>
        Hansala is operated by {c.entityName}. Use the address that matches your
        request. Full legal identity:{" "}
        <Link href="/company">company information</Link>.
      </p>

      <h2>Business &amp; product</h2>
      <p>
        <a href={mailto(c.contactEmail)}>{c.contactEmail}</a>
        {c.phone ? (
          <>
            <br />
            <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a>
          </>
        ) : null}
        <br />
        Onboarding, partnerships, billing questions, and general product mail.
      </p>

      <h2>Privacy &amp; data requests</h2>
      <p>
        <a href={mailto(c.privacyEmail, "Privacy request")}>{c.privacyEmail}</a>
        <br />
        Access, correction, export, or deletion of personal data. See{" "}
        <Link href="/data-deletion">data deletion</Link> and{" "}
        <Link href="/privacy">privacy</Link>.
      </p>

      <h2>Security</h2>
      <p>
        <a href={mailto(c.securityEmail, "Security report")}>
          {c.securityEmail}
        </a>
        <br />
        Vulnerability reports — follow the{" "}
        <Link href="/disclosure">responsible disclosure</Link> policy.
      </p>

      <h2>Status</h2>
      <p>
        Service status is published at <Link href="/status">/status</Link>{" "}
        (manual review). Health check:{" "}
        <Link href="/api/health">/api/health</Link>.
      </p>
    </LegalDoc>
  );
}
