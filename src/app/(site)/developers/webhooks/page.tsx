import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Outbound webhooks for Hansala Agent integrations.",
};

export default function WebhooksPage() {
  return (
    <LegalDoc eyebrow="Developers" title="Webhooks" updated="26 July 2026">
      <p>
        Outbound webhooks (push to your URL when events happen) are on the
        roadmap. Today, partners should poll the Agent API or use transactional
        email for human confirmations.
      </p>

      <h2>Recommended today</h2>
      <ul>
        <li>
          <code>GET /api/v1/agent/inquiries</code> — new profile inquiries
        </li>
        <li>
          <code>GET /api/v1/agent/audit-log</code> — recent agent actions
        </li>
        <li>
          Human confirm links in email for partners, references, and case
          studies
        </li>
      </ul>

      <h2>Planned events</h2>
      <ul>
        <li>
          <code>inquiry.created</code>
        </li>
        <li>
          <code>partnership.accepted</code>
        </li>
        <li>
          <code>reference.confirmed</code>
        </li>
        <li>
          <code>booking.connected</code> (Calendly / Cal.com link saved)
        </li>
      </ul>

      <h2>Signing (when shipped)</h2>
      <p>
        Payloads will include an HMAC signature header and a delivery retry
        policy. Details will be published here and in the{" "}
        <Link href="/changelog">changelog</Link> before GA.
      </p>

      <p>
        Need this sooner for a partnership?{" "}
        <a href="mailto:developers@hansala.com">developers@hansala.com</a>
      </p>
    </LegalDoc>
  );
}
