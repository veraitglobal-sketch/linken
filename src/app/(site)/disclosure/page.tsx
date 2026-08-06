import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";
import { getLegalCompany } from "@/lib/legal/company";
import { mailto } from "@/lib/legal/emails";

export const metadata: Metadata = {
  title: "Responsible disclosure",
  description:
    "How to report security vulnerabilities in Hansala responsibly.",
};

export default function DisclosurePage() {
  const security = getLegalCompany().securityEmail;

  return (
    <LegalDoc
      eyebrow="Trust"
      title="Responsible disclosure"
      updated="6 August 2026"
      currentPath="/disclosure"
    >
      <p>
        We welcome reports that help keep Hansala and its customers safe. Please
        follow this policy so we can fix issues before they are widely known.
      </p>

      <h2>How to report</h2>
      <ul>
        <li>
          Email{" "}
          <a href={mailto(security, "Vulnerability report")}>{security}</a> with
          a clear description and steps to reproduce.
        </li>
        <li>
          Include impact, affected URLs or endpoints, and any proof-of-concept
          that does not harm other customers.
        </li>
        <li>
          Machine-readable contact:{" "}
          <a href="/.well-known/security.txt">/.well-known/security.txt</a>
        </li>
      </ul>

      <h2>Rules of engagement</h2>
      <ul>
        <li>Do not access, modify, or delete other customers&apos; data.</li>
        <li>Do not disrupt availability (no DoS / load testing against production).</li>
        <li>Do not social-engineer Hansala staff or customers.</li>
        <li>
          Automated scanning is allowed only if it stays within normal product
          rate limits and does not degrade the service.
        </li>
      </ul>

      <h2>Our commitment</h2>
      <ul>
        <li>We acknowledge reports as soon as practical.</li>
        <li>
          Please allow a reasonable time to investigate and remediate before
          public disclosure.
        </li>
        <li>
          We will not pursue legal action against researchers who follow this
          policy in good faith.
        </li>
      </ul>

      <h2>Out of scope</h2>
      <p>
        Issues that require physical access, outdated browsers, or speculative
        reports without a working path to impact are usually out of scope.
        Product questions belong at <Link href="/contact">Contact</Link>, not
        this inbox.
      </p>

      <p>
        See also <Link href="/security">Security</Link>.
      </p>
    </LegalDoc>
  );
}
