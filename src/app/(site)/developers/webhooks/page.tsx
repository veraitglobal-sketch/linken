import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Outbound webhooks for Hansala — HMAC-signed event delivery.",
};

export default function WebhooksPage() {
  return (
    <LegalDoc eyebrow="Developers" title="Webhooks" updated="26 July 2026">
      <p>
        Outbound webhooks push JSON to your HTTPS URL when confirmed events
        happen. Configure in{" "}
        <Link href="/dashboard/api">Workspace → API</Link> (Pro) or via Agent
        API scope <code>webhooks:manage</code>.
      </p>

      <h2>Events</h2>
      <ul>
        <li>
          <code>inquiry.created</code> — new profile inquiry
        </li>
        <li>
          <code>partnership.accepted</code> — partnership confirmed (both
          companies notified)
        </li>
        <li>
          <code>reference.confirmed</code> — client confirmed a service
          reference
        </li>
        <li>
          <code>booking.connected</code> — Calendly / Cal.com link saved
        </li>
      </ul>

      <h2>Request</h2>
      <p>
        <code>POST</code> with <code>Content-Type: application/json</code>.
        Respond with <code>2xx</code> within ~8s. We retry up to 3 times.
      </p>
      <ul>
        <li>
          <code>Hansala-Signature</code> — <code>t=…,v1=…</code> HMAC-SHA256 of{" "}
          <code>{"${t}.${rawBody}"}</code> with your endpoint secret
        </li>
        <li>
          <code>Hansala-Event</code> — event type
        </li>
        <li>
          <code>Hansala-Delivery</code> — delivery id
        </li>
        <li>
          <code>Hansala-Idempotency-Key</code> — stable event id (dedupe)
        </li>
      </ul>

      <h2>Body</h2>
      <pre className="overflow-x-auto rounded-xl border border-line bg-[#0e1f1c] p-4 text-[12px] text-white/85">
        {`{
  "id": "evt_…",
  "type": "inquiry.created",
  "created_at": "2026-07-26T12:00:00.000Z",
  "data": { … }
}`}
      </pre>

      <h2>Agent API</h2>
      <ul>
        <li>
          <code>GET|POST /api/v1/agent/webhooks</code>
        </li>
        <li>
          <code>PATCH|DELETE /api/v1/agent/webhooks/{"{id}"}</code>
        </li>
        <li>
          <code>POST /api/v1/agent/webhooks/{"{id}"}/test</code>
        </li>
      </ul>

      <p>
        OpenAPI: <Link href="/api/v1/openapi/agent">Agent spec</Link> ·{" "}
        <a href="mailto:developers@hansala.com">developers@hansala.com</a>
      </p>
    </LegalDoc>
  );
}
