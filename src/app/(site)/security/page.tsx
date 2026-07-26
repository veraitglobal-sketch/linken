import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Security",
  description: "Hansala security practices and vulnerability reporting.",
};

export default function SecurityPage() {
  return (
    <LegalDoc eyebrow="Trust" title="Security" updated="26 July 2026">
      <p>
        Hansala is built so confirmed evidence cannot be faked by a single
        party. Security practices follow that product rule.
      </p>

      <h2>Practices</h2>
      <ul>
        <li>Authentication via Supabase Auth; sessions use HTTP-only cookies.</li>
        <li>
          Agent API keys are stored hashed (`hs_` prefix). Scopes limit what a
          key can do.
        </li>
        <li>
          Row-level security and operator checks scope data to the owning
          company.
        </li>
        <li>
          Confirmations (partners, references, case studies) require a human
          action — agents invite only.
        </li>
        <li>Transport is HTTPS in production. Secrets live in environment config.</li>
      </ul>

      <h2>Report a vulnerability</h2>
      <p>
        Email{" "}
        <a href="mailto:security@hansala.com">security@hansala.com</a> with
        steps to reproduce. Please allow reasonable time before public
        disclosure. Do not access other customers’ data while testing.
      </p>
      <p>
        Machine-readable disclosure:{" "}
        <a href="/.well-known/security.txt">/.well-known/security.txt</a>
      </p>

      <h2>More</h2>
      <p>
        <Link href="/privacy">Privacy</Link> · <Link href="/status">Status</Link>{" "}
        · <Link href="/developers">Developers</Link>
      </p>
    </LegalDoc>
  );
}
