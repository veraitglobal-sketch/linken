import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using Hansala.",
};

export default function TermsPage() {
  return (
    <LegalDoc eyebrow="Legal" title="Terms of Service" updated="26 July 2026">
      <p>
        By using Hansala you agree to these terms. If you use the APIs, you also
        agree to the <Link href="/developers/api-terms">API Terms</Link>.
      </p>

      <h2>The service</h2>
      <p>
        Hansala provides company profiles, mutually confirmed partnerships,
        references, embeds, and developer APIs. Confirmed evidence is public;
        pending invites are not treated as confirmation.
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
        harm the network’s integrity.
      </p>

      <h2>Plans &amp; billing</h2>
      <p>
        Some features (including Agent API) require a paid plan. Fees, if any,
        are shown at purchase. Taxes may apply.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The service is provided “as is”. We do not warrant uninterrupted
        availability. To the extent permitted by law, liability is limited to
        fees paid to Hansala in the three months before a claim.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:developers@hansala.com">developers@hansala.com</a> ·{" "}
        <Link href="/privacy">Privacy</Link> ·{" "}
        <Link href="/security">Security</Link>
      </p>
    </LegalDoc>
  );
}
