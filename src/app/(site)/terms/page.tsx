import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";
import { PlaceholderNotice } from "@/components/legal/placeholder-notice";
import { getLegalCompany, isLegalComplete } from "@/lib/legal/company";
import { mailto } from "@/lib/legal/emails";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using Hansala.",
};

export default function TermsPage() {
  const c = getLegalCompany();

  return (
    <LegalDoc
      eyebrow="Legal"
      title="Terms of Service"
      updated="6 August 2026"
      currentPath="/terms"
    >
      {!isLegalComplete() ? <PlaceholderNotice /> : null}
      <p>
        By using Hansala you agree to these terms. If you use the APIs, you also
        agree to the <Link href="/developers/api-terms">API Terms</Link>. The
        operator of the service is identified on{" "}
        <Link href="/company">company information</Link>
        {c.entityName ? ` (${c.entityName})` : null}.
      </p>

      <h2>The service</h2>
      <p>
        Hansala provides company profiles, mutually confirmed partnerships,
        references, embeds, and developer APIs. Confirmed evidence is public;
        pending invites are not treated as confirmation.
      </p>

      <h2>Verified</h2>
      <p>
        Verified means the company controls its business domain or approved
        identity. It does not mean Hansala guarantees the quality of its
        services.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must provide accurate information and keep credentials secure.</li>
        <li>
          You are responsible for content posted under your company workspace
          and for API keys you create.
        </li>
        <li>Do not abuse invites, scraping, or automated confirmation.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        No illegal content, impersonation, malware, or attempts to bypass
        confirmation, verification, or rate limits. We may suspend accounts that
        harm the network&apos;s integrity.
      </p>

      <h2>Plans &amp; billing</h2>
      <p>
        Some features (including Agent API) require a paid plan. Fees, if any,
        are shown at purchase. Taxes may apply. Payments are processed by Stripe
        when you buy a plan.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The service is provided “as is”. We do not warrant uninterrupted
        availability. To the extent permitted by law, liability is limited to
        fees paid to Hansala in the three months before a claim.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={mailto(c.contactEmail)}>{c.contactEmail}</a> ·{" "}
        <Link href="/privacy">Privacy</Link> ·{" "}
        <Link href="/cookies">Cookies</Link> ·{" "}
        <Link href="/security">Security</Link>
      </p>
    </LegalDoc>
  );
}
