import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";
import { getLegalCompany } from "@/lib/legal/company";
import { mailto } from "@/lib/legal/emails";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Hansala uses cookies and similar technologies.",
};

export default function CookiesPage() {
  const privacy = getLegalCompany().privacyEmail;

  return (
    <LegalDoc
      eyebrow="Legal"
      title="Cookie Policy"
      updated="6 August 2026"
      currentPath="/cookies"
    >
      <p>
        This policy explains how Hansala uses cookies and similar technologies on
        hansala.com. It complements our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>What we use</h2>
      <ul>
        <li>
          <strong>Essential</strong> — sign-in sessions (HTTP-only auth cookies),
          CSRF/security, and workspace selection so the product works.
        </li>
        <li>
          <strong>Functional</strong> — short-lived preferences such as
          onboarding draft state where needed to complete a flow.
        </li>
        <li>
          <strong>Product analytics</strong> — limited first-party events on
          public profiles and embeds (for example views), stored to operate and
          improve the service. We do not run third-party ad trackers.
        </li>
      </ul>

      <h2>What we do not use</h2>
      <p>
        We do not use advertising cookies or sell cookie data. Embeds on your
        website load from Hansala solely to show confirmed evidence you chose to
        publish.
      </p>

      <h2>Control</h2>
      <p>
        You can block or delete cookies in your browser. Essential cookies are
        required to stay signed in. For privacy requests, email{" "}
        <a href={mailto(privacy)}>{privacy}</a> or see{" "}
        <Link href="/data-deletion">data deletion</Link>.
      </p>

      <h2>More</h2>
      <p>
        <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> ·{" "}
        <Link href="/security">Security</Link>
      </p>
    </LegalDoc>
  );
}
