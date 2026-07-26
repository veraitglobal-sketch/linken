import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hansala collects, uses, and protects data.",
};

export default function PrivacyPage() {
  return (
    <LegalDoc eyebrow="Legal" title="Privacy Policy" updated="27 July 2026">
      <p>
        Hansala (“we”, “us”) operates hansala.com — company profiles, mutually
        confirmed partnerships, case studies, embeds, and developer APIs. This
        policy explains what we collect, why, and your choices.
      </p>

      <h2>Who we are</h2>
      <p>
        Controller for personal data processed through the service: Hansala,
        contact{" "}
        <a href="mailto:developers@hansala.com">developers@hansala.com</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account data: email and authentication data (via Supabase Auth).</li>
        <li>
          Company content you submit (name, website, team, logos, case studies,
          references, booking links, widget settings).
        </li>
        <li>
          Confirmation and partnership events, invite emails you send through
          the product, and Agent API audit logs for keys you create.
        </li>
        <li>
          Technical data: IP address, user agent, and cookies needed for login
          and security. See our <Link href="/cookies">Cookie Policy</Link>.
        </li>
        <li>
          Limited product analytics on public profiles and embeds (for example
          views), to operate and improve Hansala.
        </li>
      </ul>

      <h2>How we use data</h2>
      <ul>
        <li>To provide, secure, and support the product.</li>
        <li>
          To send transactional email (magic links, invites, confirmations).
        </li>
        <li>
          To expose Public and Agent APIs according to your settings and plan.
        </li>
        <li>We do not sell personal data.</li>
      </ul>

      <h2>Legal bases (EEA/UK)</h2>
      <ul>
        <li>Contract — creating an account and running your workspace.</li>
        <li>Legitimate interests — security, abuse prevention, product analytics.</li>
        <li>Consent — where we ask for it (for example optional marketing).</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        Public profile fields you publish are visible on the open web and via the
        Public API. Partnerships, references, and case confirmations appear only
        after the required confirmation. We use processors under contract:
        hosting (Vercel), database/auth (Supabase), email (Resend), and payments
        (Stripe) when you buy a plan.
      </p>

      <h2>Retention &amp; rights</h2>
      <p>
        You may request access, correction, export, or deletion of account data
        by emailing{" "}
        <a href="mailto:developers@hansala.com">developers@hansala.com</a>. You
        may also object to or restrict certain processing where the law allows.
        We retain security and abuse logs as reasonably needed.
      </p>

      <h2>International transfers</h2>
      <p>
        Our processors may process data in the EU, UK, or US. Where required, we
        rely on appropriate safeguards (for example standard contractual
        clauses).
      </p>

      <h2>Contact</h2>
      <p>
        Privacy:{" "}
        <a href="mailto:developers@hansala.com">developers@hansala.com</a>. See
        also <Link href="/cookies">Cookies</Link>,{" "}
        <Link href="/terms">Terms</Link>, and{" "}
        <Link href="/security">Security</Link>.
      </p>
    </LegalDoc>
  );
}
