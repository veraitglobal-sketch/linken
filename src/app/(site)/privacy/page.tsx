import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Hansala collects, uses, and protects data.",
};

export default function PrivacyPage() {
  return (
    <LegalDoc eyebrow="Legal" title="Privacy Policy" updated="26 July 2026">
      <p>
        Hansala (“we”, “us”) operates hansala.com — company profiles, mutually
        confirmed partnerships, and developer APIs. This policy explains what we
        collect and why.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account data: email, authentication credentials (via Supabase Auth).</li>
        <li>
          Company profile content you submit (name, website, team, case studies,
          references, booking links).
        </li>
        <li>
          Operational data: partnership and confirmation events, API audit logs
          for Agent API keys, basic product analytics on public profiles.
        </li>
        <li>
          Technical data: IP, user agent, and cookies required for login and
          security.
        </li>
      </ul>

      <h2>How we use data</h2>
      <ul>
        <li>To provide and secure the product.</li>
        <li>To send transactional email (invites, confirmations, magic links).</li>
        <li>
          To power Public and Agent APIs according to your settings and plan.
        </li>
        <li>We do not sell personal data.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        Public profile fields you publish are visible on the open web and via the
        Public API. Confirmed partners and references appear only after both
        sides confirm. We use processors such as hosting (Vercel), database/auth
        (Supabase), and email (Resend) under contracts.
      </p>

      <h2>Retention &amp; rights</h2>
      <p>
        You may request access, correction, or deletion of account data by
        emailing{" "}
        <a href="mailto:developers@hansala.com">developers@hansala.com</a>. We
        retain operational logs as needed for security and abuse prevention.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions:{" "}
        <a href="mailto:developers@hansala.com">developers@hansala.com</a>. See
        also <Link href="/terms">Terms</Link> and{" "}
        <Link href="/security">Security</Link>.
      </p>
    </LegalDoc>
  );
}
